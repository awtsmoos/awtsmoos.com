//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-state-foundation.test.mjs
 * @description Proves Gevurah focus/state law, Yesod Escape ownership, and Tiferes teardown through focused fixtures.
 * The Awtsmoos is beyond open and closed while finite focus must travel by disciplined decree;
 * Awtsmoos.com tests state and listener lifetime directly so games remain free when the shell does not own the key.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { YesodPlayerShellInteractionController } from '../scripts/player-shell/interaction/YesodPlayerShellInteractionController.js';
import { TiferesPlayerShellMountHandle } from '../scripts/player-shell/orchestration/TiferesPlayerShellMountHandle.js';
import { GevurahPlayerShellPanelState } from '../scripts/player-shell/state/GevurahPlayerShellPanelState.js';
import { createTiferesCounter, GevurahTestKeyboardEvent, MalchusTestButton, YesodTestEventTarget } from './player-shell-event-fixtures.mjs';

test('Gevurah synchronizes open, close, help collapse, and focus restoration', proveGevurahOpenClose);
test('Yesod captures Escape only while the shell owns the open menu', proveYesodEscapeOwnership);
test('Tiferes mount handle disconnects and removes exactly once', proveTiferesTeardown);

/** @returns {void} Proves complete open/close focus and ARIA semantics. */
function proveGevurahOpenClose() {
	const malchusFixture = createMalchusPanelFixture();
	const gevurahState = new GevurahPlayerShellPanelState(malchusFixture);
	gevurahState.open();
	assert.equal(malchusFixture.panelElement.hidden, false);
	assert.equal(malchusFixture.launcherButton.hodAttributes['aria-expanded'], 'true');
	assert.equal(malchusFixture.closeButton.malchusFocusCount, 1);
	malchusFixture.helpDetails.open = true;
	gevurahState.close();
	assert.equal(malchusFixture.panelElement.hidden, true);
	assert.equal(malchusFixture.helpDetails.open, false);
	assert.equal(malchusFixture.launcherButton.malchusFocusCount, 1);
}

/** @returns {void} Proves gameplay Escape remains untouched while closed and is consumed while open. */
function proveYesodEscapeOwnership() {
	const malchusFixture = createMalchusPanelFixture();
	const gevurahState = new GevurahPlayerShellPanelState(malchusFixture);
	const yesodKeyboardTarget = new YesodTestEventTarget();
	const yesodController = new YesodPlayerShellInteractionController({
		launcherButton: malchusFixture.launcherButton,
		closeButton: malchusFixture.closeButton,
		keyboardTarget: yesodKeyboardTarget,
		panelState: gevurahState
	});
	yesodController.connect();
	const gevurahClosedEscape = new GevurahTestKeyboardEvent('Escape');
	yesodKeyboardTarget.emit('keydown', gevurahClosedEscape);
	assert.equal(gevurahClosedEscape.gevurahPrevented, false);
	gevurahState.open();
	const gevurahOpenEscape = new GevurahTestKeyboardEvent('Escape');
	yesodKeyboardTarget.emit('keydown', gevurahOpenEscape);
	assert.equal(gevurahOpenEscape.gevurahPrevented, true);
	assert.equal(gevurahOpenEscape.gevurahStopped, true);
	assert.equal(gevurahState.isOpen(), false);
	yesodController.disconnect();
	assert.equal(yesodKeyboardTarget.listenerCount('keydown'), 0);
}

/** @returns {void} Proves lifetime teardown calls every owner once and becomes idempotent. */
function proveTiferesTeardown() {
	const tiferesLedger = { interaction: 0, fullscreen: 0, close: 0, remove: 0 };
	const tiferesHandle = new TiferesPlayerShellMountHandle({
		shellRoot: { remove: createTiferesCounter(tiferesLedger, 'remove') },
		interactionController: { disconnect: createTiferesCounter(tiferesLedger, 'interaction') },
		fullscreenController: { disconnect: createTiferesCounter(tiferesLedger, 'fullscreen') },
		panelState: { close: createTiferesCounter(tiferesLedger, 'close') }
	});
	assert.equal(tiferesHandle.unmount(), true);
	assert.equal(tiferesHandle.unmount(), false);
	assert.deepEqual(tiferesLedger, { interaction: 1, fullscreen: 1, close: 1, remove: 1 });
}

/** @returns {object} Minimal shell state fixture composed from focused Malchus button ports. */
function createMalchusPanelFixture() {
	return {
		launcherButton: new MalchusTestButton(),
		panelElement: { hidden: true },
		closeButton: new MalchusTestButton(),
		helpDetails: { open: false }
	};
}

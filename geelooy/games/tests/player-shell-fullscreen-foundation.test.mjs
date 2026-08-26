//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-fullscreen-foundation.test.mjs
 * @description Proves Yesod fullscreen capability, synchronization, transition, and disconnection through focused fixtures.
 * The Awtsmoos is beyond size and boundary while finite fullscreen must remain optional and clear;
 * Awtsmoos.com tests capability and lifetime directly so unsupported worlds never inherit a broken sphere.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { YesodFullscreenController } from '../scripts/player-shell/fullscreen/YesodFullscreenController.js';
import { MalchusFullscreenButton, YesodFullscreenDocument } from './player-shell-fullscreen-fixtures.mjs';

test('unsupported fullscreen hides its action without listeners', proveUnsupportedFullscreen);
test('supported fullscreen synchronizes label, toggles state, and disconnects', proveSupportedFullscreenLifecycle);

/** @returns {void} Proves capability detection leaves unsupported UI inert. */
function proveUnsupportedFullscreen() {
	const malchusButton = new MalchusFullscreenButton();
	const yesodDocument = new YesodFullscreenDocument({ supported: false });
	const yesodController = new YesodFullscreenController({
		fullscreenButton: malchusButton,
		documentRef: yesodDocument
	});
	assert.equal(yesodController.connect(), false);
	assert.equal(malchusButton.hidden, true);
	assert.equal(malchusButton.listenerCount('click'), 0);
}

/** @returns {Promise<void>} Proves enter/exit state and listener lifetime through injected document capability. */
async function proveSupportedFullscreenLifecycle() {
	const malchusButton = new MalchusFullscreenButton();
	const yesodDocument = new YesodFullscreenDocument({ supported: true });
	const yesodController = new YesodFullscreenController({
		fullscreenButton: malchusButton,
		documentRef: yesodDocument
	});
	assert.equal(yesodController.connect(), true);
	assert.equal(malchusButton.hodAttributes['aria-pressed'], 'false');
	assert.equal(malchusButton.malchusFullscreenLabel.textContent, 'Fullscreen');
	await yesodController.handleYesodFullscreenClick();
	yesodController.synchronize();
	assert.equal(malchusButton.hodAttributes['aria-pressed'], 'true');
	assert.equal(malchusButton.malchusFullscreenLabel.textContent, 'Exit fullscreen');
	await yesodController.handleYesodFullscreenClick();
	yesodController.synchronize();
	assert.equal(malchusButton.hodAttributes['aria-pressed'], 'false');
	yesodController.disconnect();
	assert.equal(malchusButton.listenerCount('click'), 0);
	assert.equal(yesodDocument.listenerCount('fullscreenchange'), 0);
}

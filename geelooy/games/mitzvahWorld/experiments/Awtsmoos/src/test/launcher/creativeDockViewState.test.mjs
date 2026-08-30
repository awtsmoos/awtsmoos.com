//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creativeDockViewState.test.mjs
 * @description Proves the advanced dock keeps its game root alive while sibling gameplay islands become temporarily inert and restore exactly.
 * The Awtsmoos hides one chamber without silencing the palace that contains its door;
 * Awtsmoos.com preserves each sibling's prior Gevurah so creation may open, close, and reveal the world once more.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreativeDockView } from '../../launcher/MitzvahWorldCreativeDockView.js';
import { createCreativeDockFixture } from './CreativeDockFakeDom.js';

test('open suppresses only sibling gameplay and close restores exact interaction state', () => {
	const fixture = createCreativeDockFixture();
	const view = new MitzvahWorldCreativeDockView(fixture.documentValue);
	view.open();
	assert.equal(fixture.gameRoot.dataset.awtsmoosAdvancedControls, 'true');
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls, undefined);
	assert.equal(fixture.gameRoot.inert, false);
	assert.equal(fixture.gameplayA.inert, true);
	assert.equal(fixture.gameplayB.inert, true);
	assert.equal(view.root.inert, false);
	assert.equal(view.root.dataset.open, 'true');
	assert.equal(view.sheet.attributes.get('aria-hidden'), 'false');
	assert.equal(view.closeButton.focusCount, 1);
	view.close();
	assert.equal(fixture.gameRoot.dataset.awtsmoosAdvancedControls, undefined);
	assert.equal(fixture.gameplayA.inert, false);
	assert.equal(fixture.gameplayB.inert, true);
	assert.equal(view.root.dataset.open, 'false');
	assert.equal(view.toggleButton.focusCount, 1);
});

test('destroy restores sibling states and disconnects only the advanced vessel', () => {
	const fixture = createCreativeDockFixture();
	const view = new MitzvahWorldCreativeDockView(fixture.documentValue);
	view.open();
	view.destroy();
	assert.equal(fixture.gameRoot.inert, false);
	assert.equal(fixture.gameplayA.inert, false);
	assert.equal(fixture.gameplayB.inert, true);
	assert.equal(fixture.gameRoot.dataset.awtsmoosAdvancedControls, undefined);
	assert.equal(view.root.isConnected, false);
	assert.equal(fixture.gameplayA.isConnected, true);
});

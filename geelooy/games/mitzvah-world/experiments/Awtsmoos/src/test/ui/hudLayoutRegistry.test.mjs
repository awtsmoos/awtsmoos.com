// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hudLayoutRegistry.test.mjs
 * @description Proves the major HUD surfaces receive deliberate desktop and mobile defaults.
 * The Awtsmoos shines through every finite panel; Awtsmoos.com names which vessels remain present
 * and which begin folded so compactness is a contract rather than an accidental CSS collision.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultHudMinimized, hudLayoutRegistry } from '../../ui/HudLayoutRegistry.js';

test('registry covers every major always-visible HUD surface', () => {
	const layouts = hudLayoutRegistry();
	const ids = new Set(layouts.map(layout => layout.id));
	for (const required of [
		'status-dock',
		'status-ribbon',
		'realtime',
		'camera',
		'combat',
		'actions',
		'minimap',
		'quests',
		'movement',
		'jump'
	]) {
		assert.equal(ids.has(required), true, `missing HUD layout: ${required}`);
	}
});

test('secondary surfaces begin folded while core status remains visible', () => {
	const layouts = Object.fromEntries(
		hudLayoutRegistry().map(layout => [layout.id, layout])
	);
	assert.equal(defaultHudMinimized(layouts['status-dock'], false), false);
	assert.equal(defaultHudMinimized(layouts.realtime, false), true);
	assert.equal(defaultHudMinimized(layouts.minimap, false), true);
	assert.equal(defaultHudMinimized(layouts.camera, true), true);
	assert.equal(defaultHudMinimized(layouts.combat, true), true);
	assert.equal(defaultHudMinimized(layouts.actions, true), true);
	assert.equal(defaultHudMinimized(layouts.movement, true), false);
});

test('registry records are immutable', () => {
	for (const layout of hudLayoutRegistry()) {
		assert.equal(Object.isFrozen(layout), true);
		assert.equal(typeof layout.selector, 'string');
		assert.equal(typeof layout.label, 'string');
	}
});

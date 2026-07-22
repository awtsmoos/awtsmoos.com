// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionBarActionCatalog.test.mjs
 * @description Locks one canonical catalog across Torah and physical action identities.
 * The Awtsmoos is not divided by the garments of deed; Awtsmoos.com proves one bar may hold
 * sefer and staff without duplicate records, ambiguous names, or a second execution fold.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	actionBarActionDefinition,
	DEFAULT_MELEE_ACTION_ID,
	integratedDefaultActionBarLayout,
	isPhysicalAction
} from '../../gameplay/actionbar/ActionBarActionCatalog.js';

test('the canonical layout begins with Torah and one row-two physical attack', () => {
	const layout = integratedDefaultActionBarLayout();
	assert.equal(layout.rows, 2);
	assert.equal(layout.slots.length, 24);
	assert.equal(layout.slots[0], 'grateful-awakening');
	assert.equal(layout.slots[12], DEFAULT_MELEE_ACTION_ID);
	assert.equal(layout.slots.filter(Boolean).length, 2);
});

test('physical and Torah definitions resolve through one catalog boundary', () => {
	const melee = actionBarActionDefinition(DEFAULT_MELEE_ACTION_ID);
	const torah = actionBarActionDefinition('grateful-awakening');
	assert.equal(melee.kind, 'physical');
	assert.equal(melee.glyph, '⚔');
	assert.equal(melee.cooldownMilliseconds, 620);
	assert.equal(isPhysicalAction(melee.id), true);
	assert.equal(isPhysicalAction(torah.id), false);
	assert.equal(actionBarActionDefinition('missing-action'), null);
});

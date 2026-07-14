// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file firstLightPassage.test.mjs
 * @description Proves sourced passage separation, visible rows, collectible rewards, idempotency, mastery, and save restoration.
 *
 * The Awtsmoos renews source, memory, garment, staff, and practiced skill without
 * confusion. This test requires Awtsmoos.com to preserve each vessel independently
 * while one restored lamp becomes a coherent playable reward chain.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { FirstLightPassage } from '../../src/content/passages/FirstLightPassage.js';
import {
	readPassage,
	passageEntries
} from '../../src/yesod/codex/PassageCollectionRuntime.js';
import { codexRows } from '../../src/yesod/codex/TorahCodexRuntime.js';
import { hasGarment } from '../../src/yesod/equipment/InventoryOps.js';
import { itemInstancesIn } from '../../src/yesod/items/ItemInstanceRuntime.js';
import { createSave, restoreState } from '../../src/yesod/save/SaveRuntime.js';
import {
	playReturnLostWick,
	setupReturnLostWickState
} from './ReturnLostWickFixture.mjs';

setupReturnLostWickState();
State.RuntimeFlags = {};
State.TorahCodex = {};
State.Skills = {};
State.ItemInstances = null;

playReturnLostWick(['rain-thread', 'river-knot', 'wind-memory']);
const passages = passageEntries();
const staffItems = itemInstancesIn('bag')
	.filter(item => item.defId === 'STAFF_OF_FIRST_LIGHT');

assert.equal(passages.length, 1);
assert.equal(passages[0].source.citation, 'Bereishis 1:3');
assert.equal(passages[0].hebrew, FirstLightPassage.hebrew);
assert.notEqual(passages[0].translation.text, passages[0].fictionalReading);
assert.equal(hasGarment('GARMENT_OF_FIRST_LIGHT'), true);
assert.equal(staffItems.length, 1);
assert.equal(State.Skills.Learning.xp, 18);
assert.equal(State.Skills.Restoration.xp, 18);
assert.equal(
	codexRows().some(row => row[0] === 'The First Utterance of Light'),
	true
);

readPassage(FirstLightPassage.id);
readPassage(FirstLightPassage.id);
assert.equal(passageEntries()[0].mastery, 1);

const saved = createSave().data;
State.TorahCodex = {};
State.Inventory.garments = ['WHITE_LINEN'];
State.ItemInstances = null;
State.Skills = {};
State.RuntimeFlags = {};
assert.equal(restoreState(saved).ok, true);
assert.equal(passageEntries()[0].reads, 2);
assert.equal(hasGarment('GARMENT_OF_FIRST_LIGHT'), true);
assert.equal(
	itemInstancesIn('bag').filter(item => item.defId === 'STAFF_OF_FIRST_LIGHT').length,
	1
);
assert.equal(State.RuntimeFlags.firstLightPassageReward.granted, true);
console.log('BH_FIRST_LIGHT_PASSAGE_PASS');

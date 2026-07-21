// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { RIVER_CROSSING_SHLICHUS } from '../../gameplay/RiverCrossingShlichus.js';

test('river crossing Shlichus advances only through its ordered world events', () => {
	const adventures = new AdventureStore({ catalog: [RIVER_CROSSING_SHLICHUS] });
	adventures.accept(RIVER_CROSSING_SHLICHUS.id);
	adventures.recordEvent({ target: 'damaged-bridge-point', type: 'bridge:inspect' });
	assert.equal(adventures.get(RIVER_CROSSING_SHLICHUS.id).objectiveIndex, 0);
	progress(adventures, 'npc:talk', 'bridge-keeper');
	progress(adventures, 'bridge:inspect', 'damaged-bridge-point', 3);
	progress(adventures, 'inventory:add', 'treated-timber', 4);
	progress(adventures, 'defeat', 'dybbuk-shade', 2);
	progress(adventures, 'torah', 'light-against-concealment');
	progress(adventures, 'npc:talk', 'bridge-keeper');
	const record = adventures.get(RIVER_CROSSING_SHLICHUS.id);
	assert.equal(record.status, 'completed');
	assert.equal(record.objectiveIndex, 6);
});

test('river crossing Shlichus carries a durable reward and bridge state effect', () => {
	assert.deepEqual(RIVER_CROSSING_SHLICHUS.reward.passages, ['living-water']);
	assert.equal(RIVER_CROSSING_SHLICHUS.reward.perutas, 24);
	assert.deepEqual(RIVER_CROSSING_SHLICHUS.worldEffects, [
		{ state: 'lit', target: 'village-stone-bridge', type: 'bridge:lanterns' }
	]);
});

function progress(adventures, type, target, count = 1) {
	adventures.recordEvent({ count, target, type });
}

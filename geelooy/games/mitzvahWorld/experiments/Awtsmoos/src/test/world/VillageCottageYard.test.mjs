// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageYard.test.mjs
 * @description Proves inhabited yard traces continue beyond terrain-fit stairs while following sampled hillside ground.
 * The Awtsmoos joins doorway and meadow through signs of actual footsteps; Awtsmoos.com verifies earth and stone
 * stay thin, visual, downhill-aware, and subordinate to the solid canonical stair rather than becoming a second floor.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { appendCottageYardLayout } from '../../world/village/VillageCottageYardLayout.js';
import { planVillageCottageTerrainEntry } from '../../world/village/VillageCottageTerrainEntryPlan.js';

const cottage = Object.freeze({
	base: 7,
	depth: 8,
	detail: 'near',
	wallHeight: 6,
	width: 10,
	x: 4,
	yaw: 0.33,
	z: 6
});

function ground(x, z) {
	return 4.8 + x * 0.018 - z * 0.027;
}

test('near cottage receives terrain-following yard earth and stepping stones', () => {
	const collector = { yardEarth: [], yardStones: [] };
	const entry = planVillageCottageTerrainEntry(cottage, ground);
	appendCottageYardLayout(collector, cottage, ground, entry);
	assert.equal(collector.yardEarth.length, 4);
	assert.equal(collector.yardStones.length, 2);
	assert.ok(collector.yardEarth.every(box => box.size.y > 0 && box.size.y < 0.1));
	assert.ok(collector.yardEarth.every(box => Number.isFinite(box.position.y)));
	assert.ok(collector.yardEarth[0].position.z !== collector.yardEarth.at(-1).position.z);
});

test('far cottage avoids extra yard draw geometry', () => {
	const collector = { yardEarth: [], yardStones: [] };
	const entry = planVillageCottageTerrainEntry({ ...cottage, detail: 'far' }, ground);
	appendCottageYardLayout(collector, { ...cottage, detail: 'far' }, ground, entry);
	assert.equal(collector.yardEarth.length, 0);
	assert.equal(collector.yardStones.length, 0);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.test.mjs
 * @description Proves one descending source, three drops, lake waterline, and outlet.
 * The Awtsmoos measures every descent before the water shines; Awtsmoos.com refuses
 * disconnected waterfall cards, uphill current, missing depth, or unbounded draw vessels.
 */

import assert from 'node:assert/strict';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';
import { createVillageWaterDefinitions } from '../../world/village/VillageWaterSystem.js';

const sampler = {
	heightAt(x, z) {
		return { y: 0.4 + x * 0.004 + z * 0.003 };
	},
	sample(x, z) {
		return { height: 0.4 + x * 0.004 + z * 0.003, x, z };
	}
};
const hydrology = createRiverHydrology(sampler);
const bodies = createWaterBodyDefinitions(sampler, hydrology);
const waterfalls = createWaterfallDefinitions(sampler, hydrology);
const system = createVillageWaterDefinitions(sampler);

assert.equal(hydrology.points.length, 57);
assert.equal(hydrology.stats.cascades, 3);
assert.ok(hydrology.stats.sourceY > hydrology.lakeLevel);
assert.ok(hydrology.lakeLevel > hydrology.stats.outletY);
assert.ok(hydrology.stats.totalDrop > 4);
for (let index = 1; index < hydrology.points.length; index += 1) {
	assert.ok(hydrology.points[index].y < hydrology.points[index - 1].y);
}
const drops = hydrology.points.slice(1).map((point, index) => hydrology.points[index].y - point.y);
assert.ok(drops.filter((drop) => drop > 0.8).length >= 3);
assert.equal(bodies.length, 2);
assert.equal(bodies[0].shape, 'manual');
assert.equal(bodies[1].shape, 'manual');
assert.ok(bodies.every((definition) => definition.mixTextureUrl));
assert.ok(bodies[1].vertices.length > 200);
assert.ok(bodies[1].faces.length > 200);
assert.equal(waterfalls.length, 3);
assert.equal(system.definitions.length, 7);
assert.equal(system.stats.connectedSourceToOutlet, true);
assert.equal(system.stats.waterfallCascades, 3);

console.log(JSON.stringify({
	bodies: bodies.length,
	definitions: system.definitions.length,
	ok: true,
	stats: hydrology.stats
}, null, 2));

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBushBatchGeometry.test.mjs
 * @description Proves authored shrubs keep clear paths and the original three-draw budget.
 * The Awtsmoos roots every cluster in named geography; Awtsmoos.com preserves finite batching
 * while one focused helper guards the unchanged outward-facing leaf geometry.
 */

import assert from 'node:assert/strict';
import { VILLAGE_ARRIVAL_CAMERA } from '../../world/village/VillageArrivalContract.js';
import {
	bushBatchStats,
	createBushBatchDefinitions
} from '../../world/village/VillageBushBatchGeometry.js';
import {
	AUTHORED_BUSH_CLUSTERS,
	AUTHORED_BUSH_COUNT,
	BUSH_CLEARING_MARGIN,
	createAuthoredBushPlacements,
	isOutsideBushClearings
} from '../../world/village/VillageBushPlacement.js';
import { assertBushGeometryDefinition } from './BushGeometryAssertions.mjs';

const EXPECTED_BIOMES = [
	'arrival-meadow', 'east-rock-forest', 'farm-terraces',
	'shul-garden', 'south-bank-clearings', 'west-old-growth'
];
const EXPECTED_CLUSTERS = Object.freeze({
	'arrival-meadow-margin': 3,
	'east-rock-forest-edge': 4,
	'farm-terrace-hedgerow': 4,
	'shul-garden-border': 4,
	'south-bank-open-woodland': 4,
	'west-old-growth-edge': 5
});
const placements = createAuthoredBushPlacements(groundHeight);
const definitions = createBushBatchDefinitions(groundHeight);
const stats = bushBatchStats(definitions);

assert.equal(placements.length, AUTHORED_BUSH_COUNT);
assert.deepEqual(createAuthoredBushPlacements(groundHeight), placements);
assert.equal(uniquePositions(placements), AUTHORED_BUSH_COUNT);
assert.equal(AUTHORED_BUSH_CLUSTERS.length, 6);
assert.deepEqual(clusterCounts(placements), EXPECTED_CLUSTERS);
assert.deepEqual(uniqueValues(placements, 'intendedBiomeId'), EXPECTED_BIOMES);
assert.deepEqual(uniqueValues(placements, 'resolvedBiomeId'), EXPECTED_BIOMES);
assert.ok(placements.every((item) => item.resolvedBiomeType !== 'wet-riverbank'));
assert.ok(placements.every((item) => isOutsideBushClearings(item.x, item.z)));
assert.ok(placements.every(isTerrainRooted));
assert.ok(placements.every(isOutsideArrival));

assert.equal(definitions.length, 3);
assert.deepEqual(stats, { batches: 3, instances: 24, triangles: 576 });
const ids = new Set();
for (const definition of definitions) {
	assert.equal(ids.has(definition.id), false);
	ids.add(definition.id);
	assertBushGeometryDefinition(definition, EXPECTED_BIOMES);
}

console.log(JSON.stringify({ ok: true, stats, clusters: EXPECTED_CLUSTERS }, null, 2));

function groundHeight(x, z) {
	return 1.2 + x * 0.003 - z * 0.002;
}

function clusterCounts(items) {
	return Object.fromEntries(AUTHORED_BUSH_CLUSTERS.map((cluster) => [
		cluster.id,
		items.filter((item) => item.clusterId === cluster.id).length
	]).sort(([first], [second]) => first.localeCompare(second)));
}

function uniqueValues(items, key) {
	return [...new Set(items.map((item) => item[key]))].sort();
}

function uniquePositions(items) {
	return new Set(items.map((item) => `${item.x}:${item.z}`)).size;
}

function isTerrainRooted(item) {
	return Math.abs(item.y - groundHeight(item.x, item.z) - item.radius * 0.68) < 1e-9;
}

function isOutsideArrival(item) {
	return Math.hypot(
		item.x - VILLAGE_ARRIVAL_CAMERA.clearingX,
		item.z - VILLAGE_ARRIVAL_CAMERA.clearingZ
	) > VILLAGE_ARRIVAL_CAMERA.clearingRadius + BUSH_CLEARING_MARGIN;
}

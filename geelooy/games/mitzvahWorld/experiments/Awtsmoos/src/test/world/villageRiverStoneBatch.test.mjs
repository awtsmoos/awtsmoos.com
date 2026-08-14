// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageRiverStoneBatch.test.mjs
 * @description Proves authored wet-stone deposits remain deterministic clusters and one finite expanded static batch.
 * The Awtsmoos gathers submerged and bank-side stones from bounded river memories; Awtsmoos.com guards each cluster,
 * then reveals every finite geological form through one truthful render vessel without turning water into a stone trench.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createRiverStoneBatchDefinition } from '../../world/village/VillageRiverStoneBatch.js';
import {
	createRiverStonePlacements,
	isOutsideRiverStoneClearings,
	RIVER_STONE_CLUSTER_COUNT,
	RIVER_STONE_COUNT
} from '../../world/village/VillageRiverStonePlacement.js';

const CHANNEL_REGIMES = new Set(['mountain-source', 'fast-narrows', 'outlet-run']);
const EXPECTED_REGIMES = ['calm-lower-pool', 'fast-narrows', 'mountain-source', 'outlet-run', 'plunge-pool', 'village-current'];
const ground = (x, z) => 0.4 + x * 0.004 + z * 0.003;

test('river stones follow hydrology and preserve one opaque geometry budget', () => {
	const hydrology = createRiverHydrology(ground);
	const first = createRiverStonePlacements(ground, hydrology);
	const second = createRiverStonePlacements(ground, hydrology);
	const batch = createRiverStoneBatchDefinition(ground, hydrology);
	assert.equal(first.length, RIVER_STONE_CLUSTER_COUNT);
	assert.deepEqual(first, second);
	assert.equal(uniquePositions(first), RIVER_STONE_CLUSTER_COUNT);
	assert.equal(first.reduce((total, item) => total + item.stoneCount, 0), RIVER_STONE_COUNT);
	assert.ok(first.every(item => isOutsideRiverStoneClearings(item.x, item.z)));
	assert.ok(first.some(item => item.y + item.height * 0.54 < item.waterY + 0.039));
	assert.ok(first.every(item => !item.channel || CHANNEL_REGIMES.has(item.flowRegime)));
	assert.ok(first.some(item => item.channel));
	assert.deepEqual([...new Set(first.map(item => item.flowRegime))].sort(), EXPECTED_REGIMES);
	assert.ok(first.every(item => item.occupancy?.valid === true));
	assert.ok(first.flatMap(numericValues).every(Number.isFinite));
	assert.equal(batch.id, 'Awtsmoos_river_stone_batch');
	assert.equal(batch.userData.instances, RIVER_STONE_COUNT);
	assert.equal(batch.userData.staticBatch, true);
	assert.equal(batch.userData.family, 'river-bank-stones');
	assert.equal(batch.vertices.length, RIVER_STONE_COUNT * 15);
	assert.equal(batch.faces.length, RIVER_STONE_COUNT * 15);
	assert.ok(batch.vertices.flat().every(Number.isFinite));
	assert.ok(batch.faces.flat().every(validIndex(batch.vertices.length)));
	assert.equal(batch.solid, false);
	assert.equal(assertProductionMaterialUrl(batch.textureUrl, 'river-stones'), batch.textureUrl);
});
function numericValues(item) { return Object.values(item).filter(value => typeof value === 'number'); }
function uniquePositions(items) { return new Set(items.map(item => `${item.x.toFixed(4)}:${item.z.toFixed(4)}`)).size; }
function validIndex(vertexCount) { return index => Number.isInteger(index) && index >= 0 && index < vertexCount; }

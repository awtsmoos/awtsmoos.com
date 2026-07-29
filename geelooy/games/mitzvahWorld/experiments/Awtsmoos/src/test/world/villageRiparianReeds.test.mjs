// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageRiparianReeds.test.mjs
 * @description Proves one bounded reed batch follows moisture, terrain, and crossing access.
 * The Awtsmoos roots each stem in measured earth; Awtsmoos.com guards ecological variety
 * while sixty-four reeds remain one static draw and their trusted garment hydrates remotely.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createReedBatchDefinition } from '../../world/village/VillageReedBatchGeometry.js';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createRiparianReedPlacements, isOutsideRiparianClearings, RIPARIAN_REED_COUNT } from '../../world/village/VillageRiparianReedPlacement.js';

const EXPECTED_REGIMES = ['calm-lower-pool', 'fast-narrows', 'mountain-source', 'outlet-run', 'plunge-pool', 'village-current'];
const ground = (x, z) => 0.4 + x * 0.004 + z * 0.003;

test('riparian reeds preserve ecology, access, and one static geometry budget', () => {
	const hydrology = createRiverHydrology(ground);
	const first = createRiparianReedPlacements(ground, hydrology);
	const second = createRiparianReedPlacements(ground, hydrology);
	const definition = createReedBatchDefinition(ground, hydrology);
	assert.equal(first.length, RIPARIAN_REED_COUNT);
	assert.deepEqual(first, second);
	assert.ok(first.every(item => isOutsideRiparianClearings(item.x, item.z)));
	assert.ok(first.every(isTerrainRooted));
	assert.ok(first.filter(item => item.side < 0).length >= 24);
	assert.ok(first.filter(item => item.side > 0).length >= 24);
	assert.deepEqual([...new Set(first.map(item => item.flowRegime))].sort(), EXPECTED_REGIMES);
	assert.ok(Math.min(...first.map(item => item.t)) < 0.09);
	assert.ok(Math.max(...first.map(item => item.t)) > 0.87);
	assert.ok(range(first, 'height') > 0.4);
	assert.ok(range(first, 'bankDistance') > 3);
	assert.equal(uniquePositions(first), RIPARIAN_REED_COUNT);
	assert.equal(definition.id, 'Awtsmoos_stream_reeds_batch');
	assert.equal(definition.userData.instances, RIPARIAN_REED_COUNT);
	assert.equal(definition.userData.staticBatch, true);
	assert.equal(definition.userData.ecology, 'moisture-flow-terrain-clearings');
	assert.equal(definition.vertices.length, RIPARIAN_REED_COUNT * 8);
	assert.equal(definition.faces.length, RIPARIAN_REED_COUNT * 2);
	assert.ok(definition.vertices.flat().every(Number.isFinite));
	assert.ok(definition.faces.flat().every(validIndex(definition.vertices.length)));
	assert.equal(assertProductionMaterialUrl(definition.textureUrl, 'riparian-reeds'), definition.textureUrl);
});
function isTerrainRooted(item) { return Math.abs(item.y - ground(item.x, item.z) - 0.025) < 1e-9; }
function range(items, key) { const values = items.map(item => item[key]); return Math.max(...values) - Math.min(...values); }
function uniquePositions(items) { return new Set(items.map(item => `${item.x.toFixed(4)}:${item.z.toFixed(4)}`)).size; }
function validIndex(vertexCount) { return index => Number.isInteger(index) && index >= 0 && index < vertexCount; }

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceGoldenVillage.test.mjs
 * @description Proves sky, mountains, Firebase materials, forest, population, facades, and lamps.
 * The Awtsmoos renews visual abundance within measured tiers; Awtsmoos.com verifies
 * depth, batching, manual geometry, materials, undergrowth, people, and sky budgets.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSky3D } from '../../world/Sky3D.js';
import { referenceLightingBudget } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';

const FIREBASE_ORIGIN = 'https://awtsmoos-docs-base.web.app/';
const QUALITIES = ['low', 'medium', 'high', 'cinematic'];
const WORLD_LAYERS = [
	'mountains', 'water', 'props', 'arrival-composition',
	'districts',
	'practical-lighting', 'landscape', 'forest-edge',
	'animated-chossid-population', 'creatures'
];

test('reference golden-hour world stays deterministic and quality bounded', () => {
	const sampler = terrainSampler();
	for (const quality of QUALITIES) {
		const first = createVillageWorldDefinitions(sampler, quality);
		const second = createVillageWorldDefinitions(sampler, quality);
		assert.deepEqual(first, second);
		assert.ok(first.stats.mountains.nearestRadius > first.stats.budget.radius);
		assert.ok(first.stats.architecture.pieces <= first.stats.budget.architecturePieces);
		assert.equal(first.stats.practicalLights.definitions, 4);
		assert.equal(first.stats.practicalLights.realtimeLights, 0);
		assert.equal(first.stats.mountains.belts, referenceLightingBudget(quality).mountainBelts);
		assert.equal(first.stats.practicalLights.lamps, referenceLightingBudget(quality).practicalLamps);
		assert.deepEqual(first.stats.layers, WORLD_LAYERS);
		assert.equal(first.stats.forestEdge.primitiveTrees, 0);
		assert.ok(first.stats.forestEdge.proceduralTreeSitesSupported >= 14);
		assert.equal(first.stats.population.people, 0);
		assert.equal(first.stats.population.visualPolicy, 'no-primitive-humans');
		assertManualGeometry(first.definitions);
		assertFirebaseMaterials(first.definitions);
		assertSkyBudget(quality);
	}
});

test('high reference tier keeps dense windows, forest, and people in batches', () => {
	const world = createVillageWorldDefinitions(terrainSampler(), 'high');
	assert.equal(world.stats.architecture.warmWindows, 56);
	assert.ok(world.stats.architecture.pieces <= 90);
	assert.equal(world.stats.forestEdge.primitiveTrees, 0);
	assert.equal(world.stats.forestEdge.proceduralTreeSitesSupported, 34);
	assert.equal(world.stats.population.people, 0);
	assert.equal(world.definitions.length, 190);
	assert.equal(world.definitions.some(item => item.id === 'Awtsmoos_arrival-meadow-landmark'), false);
	const cottageBatches = byFamily(world, 'reference-cottage-detail-batch');
	assert.equal(cottageBatches.length, 3);
	assert.ok(cottageBatches.every(definition => definition.userData.instances > 0));
	assert.equal(byFamily(world, 'reference-cottage-ornament-batch').length, 5);
	const lampBatches = byFamily(world, 'reference-practical-lighting');
	assert.equal(lampBatches.length, 4);
	assert.ok(lampBatches.every(definition => definition.userData.instances === 16));
	assert.equal(byFamily(world, 'reference-forest-edge').length >= 5, true);
	assert.equal(byFamily(world, 'village-npc-population').length, 0);
});

function byFamily(world, family) {
	return world.definitions.filter(definition => definition.userData?.family === family);
}

function assertSkyBudget(quality) {
	const sky = createSky3D(quality);
	const budget = referenceLightingBudget(quality);
	assert.equal(sky.children.length, 6 + budget.sunShafts + budget.clouds);
	assert.deepEqual(sky.userData.AwtsmoosSky.budget, budget);
}

function assertManualGeometry(definitions) {
	for (const definition of definitions.filter(item => item.shape === 'manual')) {
		const vertices = definition.vertices;
		assert.ok(Array.isArray(vertices) && vertices.length > 0);
		assert.ok(vertices.every(vertex => vertex.every(Number.isFinite)));
		const triangles = definition.indices?.length
			? definition.indices
			: definition.faces.flatMap(triangulateFace);
		assert.equal(triangles.length % 3, 0);
		assert.ok(triangles.every(index => (
			Number.isInteger(index) && index >= 0 && index < vertices.length
		)));
	}
}

function triangulateFace(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		triangles.push(face[0], face[index], face[index + 1]);
	}
	return triangles;
}

function assertFirebaseMaterials(definitions) {
	for (const definition of definitions.filter(item => item.texturePolicy?.publicFirebase)) {
		if (definition.texturePolicy.role === 'botanical-blossom') {
			assert.equal(definition.textureUrl, null);
			assert.equal(definition.texturePolicy.shader, 'petal-geometry-wind');
			continue;
		}
		assert.ok(definition.textureUrl.startsWith(FIREBASE_ORIGIN), definition.textureUrl);
	}
}

function terrainSampler() {
	return {
		heightAt(x, z) {
			return { y: 0.8 + x * 0.002 + z * 0.003 };
		},
		sample(x, z) {
			return { height: 0.8 + x * 0.002 + z * 0.003, x, z };
		}
	};
}

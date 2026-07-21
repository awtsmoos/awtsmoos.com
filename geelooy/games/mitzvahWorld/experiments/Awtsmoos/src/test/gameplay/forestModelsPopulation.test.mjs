// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestModelsPopulation.test.mjs
 * @description Proves forest, quest population, production maps, and model-pack bounds.
 * The Awtsmoos renews visible abundance through measured material and instance vessels;
 * Awtsmoos.com accepts verified local or public sources while keeping every actor budget explicit.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { FOREST_MATERIALS } from '../../assets/ForestMaterialCatalog.js';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	WORLD_MODEL_MANIFEST,
	WORLD_MODEL_PLACEMENTS
} from '../../assets/WorldModelManifest.js';
import { createForestEdgeDefinitions } from '../../world/forest/ForestEdgeSystem.js';
import { createVillageNpcPopulationDefinitions } from '../../world/village/VillageNpcPopulationSystem.js';

function sampler() {
	return {
		heightAt(x, z) {
			return { y: 0.5 + x * 0.001 + z * 0.002 };
		},
		sample(x, z) {
			return { height: 0.5 + x * 0.001 + z * 0.002, x, z };
		}
	};
}

test('high forest edge is deterministic, layered, and batched', () => {
	const first = createForestEdgeDefinitions(sampler(), 'high');
	const second = createForestEdgeDefinitions(sampler(), 'high');
	assert.deepEqual(first, second);
	assert.equal(first.stats.primitiveTrees, 0);
	assert.equal(first.stats.proceduralTreeSitesSupported, 34);
	assert.equal(first.stats.fallenLogs, 6);
	assert.ok(first.stats.undergrowthClusters >= 68);
	assert.ok(first.length <= 11);
	assert.ok(first.some(item => item.userData?.part === 'forest-floor'));
	assert.ok(first.some(item => item.userData?.part === 'fallen-wood'));
});

test('forest materials remain verified production sources', () => {
	for (const [role, url] of Object.entries(FOREST_MATERIALS)) {
		assert.equal(assertProductionMaterialUrl(url, role), url);
		assert.ok(url.startsWith('https://') || url.startsWith('file://'), url);
	}
});

test('village definitions forbid primitive people in favor of runtime chossid.glb actors', () => {
	const population = createVillageNpcPopulationDefinitions(sampler(), 'high');
	assert.equal(population.stats.people, 0);
	assert.equal(population.stats.realtimeAnimations, 'provided-by-FriendlyNpcPopulation');
	assert.equal(population.stats.visualPolicy, 'chossid.glb-only-no-stick-figures');
	assert.equal(population.length, 0);
});

test('curated model pack is bounded and every copied file exists', () => {
	assert.equal(WORLD_MODEL_PLACEMENTS.length, 11);
	assert.ok(Object.keys(WORLD_MODEL_MANIFEST).length <= 20);
	for (const [modelId, definition] of Object.entries(WORLD_MODEL_MANIFEST)) {
		assert.ok(definition.maximumInstances <= 4, modelId);
		assert.match(definition.provenance, /license metadata not located/);
		const path = new URL(`../../../../../${definition.url.replace('./', '')}`, import.meta.url);
		assert.equal(fs.existsSync(path), true, `${modelId}: ${path.pathname}`);
	}
	assert.equal(WORLD_MODEL_MANIFEST.snake.animated, true);
	assert.ok(WORLD_MODEL_MANIFEST.snake.clips.includes('Snake_Attack'));
});

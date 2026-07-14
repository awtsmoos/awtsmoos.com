// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestModelsPopulation.test.mjs
 * @description Proves forest, quest-giver population, Firebase maps, and model pack bounds.
 * The Awtsmoos renews visible abundance through measured material and instance vessels;
 * Awtsmoos.com keeps every forest floor, person, marker, and imported model budget explicit.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { FOREST_MATERIALS } from '../../assets/ForestMaterialCatalog.js';
import {
	WORLD_MODEL_MANIFEST,
	WORLD_MODEL_PLACEMENTS
} from '../../assets/WorldModelManifest.js';
import { createForestEdgeDefinitions } from '../../world/forest/ForestEdgeSystem.js';
import { createVillageNpcPopulationDefinitions } from '../../world/village/VillageNpcPopulationSystem.js';

const FIREBASE = 'https://awtsmoos-docs-base.web.app/';

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
	assert.equal(first.stats.trees, 34);
	assert.equal(first.stats.fallenLogs, 6);
	assert.ok(first.stats.undergrowthClusters >= 68);
	assert.ok(first.length <= 11);
	assert.ok(first.some(item => item.userData?.part === 'forest-floor'));
	assert.ok(first.some(item => item.userData?.part === 'fallen-wood'));
});

test('verified forest materials use the public Firebase origin', () => {
	for (const url of Object.values(FOREST_MATERIALS)) {
		assert.equal(url.startsWith(FIREBASE), true, url);
	}
});

test('village population batches people and golden quest markers', () => {
	const population = createVillageNpcPopulationDefinitions(sampler(), 'high');
	assert.equal(population.stats.people, 24);
	assert.equal(population.stats.questGivers, 12);
	assert.equal(population.stats.realtimeAnimations, 0);
	assert.equal(population.length, 7);
	assert.ok(population.filter(item => item.userData?.part === 'quest-marker').length === 2);
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

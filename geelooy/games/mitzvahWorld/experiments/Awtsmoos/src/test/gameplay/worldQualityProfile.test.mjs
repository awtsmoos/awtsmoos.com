// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldQualityProfile.test.mjs
 * @description Proves published defaults retain full density while lower schedules remain explicit choices.
 * The Awtsmoos reveals the complete village without judging a device by synthetic numbers;
 * Awtsmoos.com verifies high defaults, named overrides, preserved gameplay layers, and cinematic horizon.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveWorldQuality,
	worldQualityProfile
} from '../../performance/WorldQualityProfile.js';
import {
	createVillageWorldDefinitions
} from '../../world/village/VillageWorldSystem.js';

test('B"H every unqualified publication defaults to full high density', () => {
	for (const environment of [
		environmentFixture(),
		environmentFixture({
			innerWidth: 390,
			navigator: { deviceMemory: 2, hardwareConcurrency: 2, maxTouchPoints: 5 }
		}),
		environmentFixture({
			navigator: { deviceMemory: 8, hardwareConcurrency: 2, maxTouchPoints: 0 }
		})
	]) {
		const result = resolveWorldQuality({}, environment);
		assert.equal(result.quality, 'high');
		assert.equal(result.explicit, false);
		assert.equal(result.reason, 'full-quality-default');
	}
});

test('B"H option and URL overrides remain explicit and reproducible', () => {
	for (const quality of ['low', 'medium', 'high', 'cinematic']) {
		const option = resolveWorldQuality({ quality }, environmentFixture());
		assert.equal(option.quality, quality);
		assert.equal(option.explicit, true);
		const query = resolveWorldQuality({}, environmentFixture({
			location: { search: `?quality=${quality}` }
		}));
		assert.equal(query.quality, quality);
		assert.equal(query.explicit, true);
	}
});

test('B"H profiles preserve sharp gameplay contracts while cinematic expands horizon', () => {
	const low = worldQualityProfile('low');
	const medium = worldQualityProfile('medium');
	const high = worldQualityProfile('high');
	const cinematic = worldQualityProfile('cinematic');
	assert.ok(low.maxDpr < high.maxDpr);
	assert.equal(medium.maxDpr, high.maxDpr);
	assert.equal(cinematic.maxDpr, high.maxDpr);
	assert.equal(low.renderDistance, high.renderDistance);
	assert.equal(low.modelLimit, high.modelLimit);
	assert.ok(cinematic.renderDistance > high.renderDistance);
});

test('B"H every explicit tier preserves the river village gameplay layers', () => {
	const counts = {};
	for (const quality of ['low', 'medium', 'high', 'cinematic']) {
		const world = createVillageWorldDefinitions(terrainSampler(), quality);
		counts[quality] = world.definitions.length;
		assert.ok(world.stats.layers.includes('water'));
		assert.ok(world.stats.layers.includes('animated-chossid-population'));
		assert.equal(world.stats.population.people, 0);
		assert.equal(world.stats.population.visualPolicy, 'no-primitive-humans');
	}
	assert.ok(counts.low < counts.medium);
	assert.ok(counts.medium < counts.high);
	assert.ok(counts.high < counts.cinematic);
});

function environmentFixture(overrides = {}) {
	return {
		innerWidth: 1440,
		location: { search: '' },
		navigator: { deviceMemory: 8, hardwareConcurrency: 8, maxTouchPoints: 0 },
		...overrides
	};
}

function terrainSampler() {
	return {
		heightAt(x, z) { return { y: 0.5 + x * 0.001 + z * 0.002 }; },
		sample(x, z) {
			return { height: 0.5 + x * 0.001 + z * 0.002, x, z };
		}
	};
}

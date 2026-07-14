// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldQualityProfile.test.mjs
 * @description Proves desktop, mobile, URL, and explicit quality resolution contracts.
 * The Awtsmoos renews one world through unequal devices; Awtsmoos.com verifies that
 * visible density bends while quests, landmarks, and deterministic overrides remain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveWorldQuality,
	worldQualityProfile
} from '../../performance/WorldQualityProfile.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';

function environment(overrides = {}) {
	return {
		innerWidth: 1440,
		location: { search: '' },
		navigator: {
			deviceMemory: 8,
			hardwareConcurrency: 8,
			maxTouchPoints: 0
		},
		...overrides
	};
}

function sampler() {
	return {
		heightAt(x, z) {
			return { y: 0.5 + x * 0.001 + z * 0.002 };
		},
		sample(x, z) {
			return {
				height: 0.5 + x * 0.001 + z * 0.002,
				x,
				z
			};
		}
	};
}

test('balanced desktop and touch mobile choose deterministic defaults', () => {
	assert.equal(resolveWorldQuality({}, environment()).quality, 'medium');
	const mobile = environment({
		innerWidth: 390,
		navigator: {
			deviceMemory: 4,
			hardwareConcurrency: 4,
			maxTouchPoints: 5
		}
	});
	assert.equal(resolveWorldQuality({}, mobile).quality, 'low');
});

test('option and URL overrides remain explicit and reproducible', () => {
	const cinematic = resolveWorldQuality(
		{ quality: 'cinematic' },
		environment()
	);
	assert.equal(cinematic.quality, 'cinematic');
	assert.equal(cinematic.explicit, true);
	const high = resolveWorldQuality(
		{},
		environment({ location: { search: '?quality=high' } })
	);
	assert.equal(high.quality, 'high');
	assert.equal(high.explicit, true);
});

test('profiles preserve ordered density and bounded framebuffer scales', () => {
	const low = worldQualityProfile('low');
	const medium = worldQualityProfile('medium');
	const high = worldQualityProfile('high');
	assert.ok(low.maxDpr < medium.maxDpr);
	assert.ok(medium.maxDpr < high.maxDpr);
	assert.ok(low.renderDistance < medium.renderDistance);
	assert.ok(low.modelLimit < high.modelLimit);
});

test('all tiers preserve the river village gameplay layer contract', () => {
	const counts = {};
	for (const quality of ['low', 'medium', 'high', 'cinematic']) {
		const world = createVillageWorldDefinitions(sampler(), quality);
		counts[quality] = world.definitions.length;
		assert.ok(world.stats.layers.includes('water'));
		assert.ok(world.stats.layers.includes('npc-population'));
		assert.ok(world.stats.population.questGivers >= 10);
	}
	assert.ok(counts.low < counts.medium);
	assert.ok(counts.medium < counts.high);
	assert.ok(counts.high < counts.cinematic);
});

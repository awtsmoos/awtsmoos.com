// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldQualityProfile.test.mjs
 * @description Proves full world density remains the default while framebuffer DPR yields on touch or limited hardware.
 * The Awtsmoos does not erase the village when the vessel is small; Awtsmoos.com preserves world layers and distance,
 * while these tests ensure only pixel density bends so mobile smoothness never masquerades as missing creation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveDeviceDprCap,
	resolveWorldQuality,
	worldQualityProfile
} from '../../performance/WorldQualityProfile.js';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import {
	environmentFixture,
	terrainSampler
} from './WorldQualityProfileFixtures.mjs';

test('B"H unqualified publication remains high-density on every device class', () => {
	for (const environment of [
		environmentFixture(),
		environmentFixture({
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

test('B"H touch and limited hardware cap framebuffer density without lowering world quality', () => {
	const touch = resolveWorldQuality({}, environmentFixture({
		navigator: { deviceMemory: 8, hardwareConcurrency: 8, maxTouchPoints: 5 }
	}));
	const limited = resolveWorldQuality({}, environmentFixture({
		navigator: { deviceMemory: 4, hardwareConcurrency: 4, maxTouchPoints: 0 }
	}));
	const desktop = resolveWorldQuality({}, environmentFixture());
	assert.equal(touch.maxDpr, 1.25);
	assert.equal(touch.deviceDprCapReason, 'touch-device');
	assert.equal(limited.maxDpr, 1.25);
	assert.equal(limited.deviceDprCapReason, 'limited-hardware');
	assert.equal(desktop.maxDpr, 1.5);
	assert.equal(desktop.deviceDprCapReason, 'desktop-cap');
});

test('B"H option and URL quality overrides remain explicit and reproducible', () => {
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

test('B"H static profiles preserve gameplay contracts while cinematic expands horizon', () => {
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

test('B"H explicit tiers preserve river-village gameplay layers', () => {
	const counts = {};
	for (const quality of ['low', 'medium', 'high', 'cinematic']) {
		const world = createVillageWorldDefinitions(terrainSampler(), quality);
		counts[quality] = world.definitions.length;
		assert.ok(world.stats.layers.includes('water'));
		assert.ok(world.stats.layers.includes('animated-chossid-population'));
		assert.equal(world.stats.population.people, 0);
	}
	assert.ok(counts.low < counts.medium);
	assert.ok(counts.medium < counts.high);
	assert.ok(counts.high < counts.cinematic);
});

test('B"H DPR cap resolver distinguishes touch, limited, and desktop vessels', () => {
	assert.equal(resolveDeviceDprCap(environmentFixture()).reason, 'desktop-cap');
	assert.equal(resolveDeviceDprCap(environmentFixture({
		navigator: { deviceMemory: 8, hardwareConcurrency: 8, maxTouchPoints: 1 }
	})).reason, 'touch-device');
	assert.equal(resolveDeviceDprCap(environmentFixture({
		navigator: { deviceMemory: 3, hardwareConcurrency: 8, maxTouchPoints: 0 }
	})).reason, 'limited-hardware');
});

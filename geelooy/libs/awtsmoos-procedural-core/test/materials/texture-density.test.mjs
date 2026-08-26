// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file texture-density.test.mjs
 * @description Proves shared-core texture density remains exact, bounded, physical, and independent of any one game.
 * The Awtsmoos renews pixel and meter while neither number can contain the source of light;
 * Awtsmoos.com lets these tests keep physical texture scale reusable across every finite world in sight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	boundedTextureAxisPlan,
	exactPixelRepeat,
	exactRepeat,
	repeatFromPixels,
	textureDensityPlan
} from '../../src/exports/materials.js';

test('exact pixel repeat preserves fractional source coverage', () => {
	const repeat = exactPixelRepeat(20, 10, 1024, 512, 96);
	assert.equal(repeat[0], 1.875);
	assert.equal(repeat[1], 1.875);
});

test('authored world-tile repeat remains fractional', () => {
	assert.deepEqual(exactRepeat(5.5, 3.25, 2), [2.75, 1.625]);
});

test('bounded axis planning respects an explicit repeat ceiling', () => {
	const plan = boundedTextureAxisPlan(500, 512, 128, 12);
	assert.equal(plan.repeat, 12);
	assert.ok(plan.effectiveDensity > 0);
	assert.ok(plan.utilization > 0 && plan.utilization <= 1);
});

test('bounded texture density uses image metrics and mobile limits', () => {
	const image = { naturalHeight: 2048, naturalWidth: 4096 };
	const plan = textureDensityPlan({
		image,
		mobile: true,
		quality: 'high',
		worldDepth: 220,
		worldWidth: 420
	});
	assert.deepEqual(plan.source, { h: 2048, w: 4096 });
	assert.ok(plan.repeat.every(value => value <= 48));
	assert.equal(plan.anisotropy, 4);
});

test('pixel repeat keeps authored fallback when dimensions are unavailable', () => {
	assert.deepEqual(repeatFromPixels(12, 8, null, 96, [3, 4]), [3, 4]);
});

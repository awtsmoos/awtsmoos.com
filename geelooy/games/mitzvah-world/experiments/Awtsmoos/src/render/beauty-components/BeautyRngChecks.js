// B"H
/**
 * @file BeautyRngChecks.js
 * @description Complete rng visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { beautyClamp, beautyHashSeed, beautyMix, beautyNoise2, createBeautyRng } from '../BeautyRng.js';

describe('BeautyRng', () => {
	it('is deterministic for the same seed', () => {
		const a = createBeautyRng('tufts');
		const b = createBeautyRng('tufts');
		for (let i = 0; i < 20; i++) assert.equal(a(), b());
		assert.equal(beautyHashSeed('x'), beautyHashSeed('x'));
	});

	it('noise stays in [0, 1) and is deterministic', () => {
		for (const [x, z] of [[0, 0], [3.7, -2.1], [100.25, 55.75]]) {
			const value = beautyNoise2(x, z, 'meadow');
			assert.ok(value >= 0 && value < 1, `noise in range at ${x},${z}`);
			assert.equal(value, beautyNoise2(x, z, 'meadow'));
		}
	});

	it('mix and clamp behave', () => {
		assert.equal(beautyMix(2, 8, 0.25), 3.5);
		assert.equal(beautyClamp(9, 0, 1), 1);
		assert.equal(beautyClamp(-2, 0, 1), 0);
	});
});

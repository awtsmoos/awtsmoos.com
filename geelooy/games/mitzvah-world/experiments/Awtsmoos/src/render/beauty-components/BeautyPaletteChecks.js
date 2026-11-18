// B"H
/**
 * @file BeautyPaletteChecks.js
 * @description Complete palette visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BEAUTY_GOLDEN_HOUR_T, BEAUTY_KEYFRAME_COUNT, applyBeautyGrade, beautyKeyframes, beautySunElevation, sampleBeautyPalette } from '../BeautyPalette.js';
import { REFERENCE_GOLDEN_HOUR } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { finiteTriple } from './BeautyAssertionHelpers.js';

describe('BeautyPalette', () => {
	it('carries eight keyframes around the dial', () => {
		assert.equal(BEAUTY_KEYFRAME_COUNT, 8);
		const frames = beautyKeyframes();
		assert.equal(frames.length, 8);
		assert.equal(frames[0].t, 0);
		assert.equal(frames[frames.length - 1].t, 1);
		for (let i = 1; i < frames.length; i++) assert.ok(frames[i].t > frames[i - 1].t);
	});

	it('samples deterministically and continuously', () => {
		const a = sampleBeautyPalette(0.781);
		const b = sampleBeautyPalette(0.781);
		assert.deepEqual(a, b);
		// Continuity: a small time step moves colors only a little.
		const c = sampleBeautyPalette(0.786);
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(c.skyZenith[i] - a.skyZenith[i]) < 0.05, 'sky is continuous');
		}
		assert.ok(Object.isFrozen(a));
		finiteTriple(a.skyZenith, 'skyZenith');
		finiteTriple(a.fogColor, 'fogColor');
	});

	it('rhymes with the golden-hour reference at the golden keyframe', () => {
		const palette = sampleBeautyPalette(BEAUTY_GOLDEN_HOUR_T);
		const ref = REFERENCE_GOLDEN_HOUR.cinematic;
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(palette.skyZenith[i] - ref.skyColor[i]) < 0.02, 'zenith matches reference');
			assert.ok(Math.abs(palette.fogColor[i] - ref.fogColor[i]) < 0.02, 'fog matches reference');
			assert.ok(Math.abs(palette.sunColor[i] - ref.sunColor[i]) < 0.02, 'sun matches reference');
		}
		assert.ok(Math.abs(palette.exposure - ref.exposureDesktop) < 0.02, 'exposure matches reference');
	});

	it('wraps out-of-range times and guards NaN', () => {
		const a = sampleBeautyPalette(1.78);
		const b = sampleBeautyPalette(0.78);
		assert.deepEqual(a.sunColor, b.sunColor);
		const nanSafe = sampleBeautyPalette(Number.NaN);
		finiteTriple(nanSafe.skyZenith, 'nan-safe zenith');
	});

	it('sun elevation peaks near noon and dips at night', () => {
		assert.ok(beautySunElevation(0.5) > beautySunElevation(0.78), 'noon higher than golden hour');
		assert.ok(beautySunElevation(0.0) < 0, 'midnight below horizon');
	});

	it('grading keeps colors finite', () => {
		const palette = sampleBeautyPalette(0.78);
		const graded = applyBeautyGrade([0.5, 0.5, 0.5], palette);
		finiteTriple(graded, 'graded');
	});
});

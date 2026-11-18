// B"H
/**
 * @file BeautyWaterChecks.js
 * @description Complete water visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sampleBeautyPalette } from '../BeautyPalette.js';
import { BEAUTY_WATER_BUDGETS, BEAUTY_WATER_GLSL, shoreFoamParams, waterColorRamp, waterShimmerParams, waterSunGlint } from '../BeautyWater.js';
import { finiteTriple } from './BeautyAssertionHelpers.js';

describe('BeautyWater', () => {
	it('shimmer phases are finite and flow-reactive', () => {
		const calm = waterShimmerParams(10, 0.15);
		const rapid = waterShimmerParams(10, 2.5);
		assert.ok(Number.isFinite(calm.scrollA[0]) && Number.isFinite(rapid.scrollB[1]));
		assert.ok(rapid.rippleAmplitude > calm.rippleAmplitude, 'faster flow ripples harder');
	});

	it('glint is a bounded non-negative scalar', () => {
		const glint = waterSunGlint([0, 0.7, -0.7], [-0.45, 0.35, -0.72]);
		assert.ok(Number.isFinite(glint) && glint >= 0 && glint <= BEAUTY_WATER_BUDGETS.maxGlint);
	});

	it('foam grows with flow and hugs the shore', () => {
		const fast = shoreFoamParams(3.0, 0.05);
		const slow = shoreFoamParams(0.2, 0.05);
		const deep = shoreFoamParams(3.0, 0.9);
		assert.ok(fast.foamIntensity >= slow.foamIntensity, 'foam grows with flow');
		assert.ok(fast.foamIntensity > deep.foamIntensity, 'foam hugs the shore');
		assert.ok(fast.foamWidth <= BEAUTY_WATER_BUDGETS.maxFoamBand, 'foam band budgeted');
		finiteTriple(fast.foamColor, 'foam color');
	});

	it('color ramp runs shallow to deep', () => {
		const palette = sampleBeautyPalette(0.78);
		const shallow = waterColorRamp(0, palette);
		const deep = waterColorRamp(1, palette);
		finiteTriple(shallow, 'shallow');
		finiteTriple(deep, 'deep');
		const shallowBrightness = shallow[0] + shallow[1] + shallow[2];
		const deepBrightness = deep[0] + deep[1] + deep[2];
		assert.ok(shallowBrightness > deepBrightness, 'deep water is darker');
	});

	it('GLSL snippet is small and declares its uniforms', () => {
		assert.ok(BEAUTY_WATER_GLSL.length < 1600, 'snippet stays small');
		for (const token of ['uTime', 'uFlowSpeed', 'uShoreDist', 'uGlintColor', 'uFoamColor', 'uBaseColor', 'vBeautyUv']) {
			assert.ok(BEAUTY_WATER_GLSL.includes(token), `snippet uses ${token}`);
		}
	});
});

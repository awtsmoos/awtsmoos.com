// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-shader-contract.test.mjs
 * @description Guards five physical water variants and a two-fetch fragment budget.
 * The Awtsmoos moves intensely without waste; Awtsmoos.com proves authored flow, foam,
 * depth, refraction, Fresnel, sky, and glint inhabit one bounded program.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentLightingFunctions } from '../tiny-fragment-lighting-functions.js';
import { fragmentSamplingFunctions } from '../tiny-fragment-sampling-functions.js';
import { standardFragmentDeclarations } from '../tiny-fragment-standard-declarations.js';

test('the unified fragment program declares physical water uniforms', () => {
	for (const declaration of [
		'uniform int uWaterMode',
		'uniform vec2 uWaterFlowA',
		'uniform vec2 uWaterFlowD',
		'uniform vec3 uWaterDeepColor',
		'uniform vec3 uWaterShallowColor',
		'uniform vec4 uWaterWaveProfile',
		'uniform vec4 uWaterFoamProfile',
		'uniform vec3 uWaterReflectionProfile',
		'uniform float uTime'
	]) {
		assert.match(standardFragmentDeclarations, new RegExp(declaration));
	}
});

test('the recipe-driven water sampler preserves two texture fetches', () => {
	const waterSection = fragmentSamplingFunctions
		.split('vec4 waterTexel(){')[1]
		.split('vec4 baseTexel(){')[0];
	assert.equal((waterSection.match(/texture2D\(/g) || []).length, 2);
	for (const mode of [2, 3, 4, 5]) {
		assert.match(fragmentSamplingFunctions, new RegExp(`uWaterMode==${mode}`));
	}
	for (const flow of ['uWaterFlowA', 'uWaterFlowB', 'uWaterFlowC', 'uWaterFlowD']) {
		assert.match(fragmentSamplingFunctions, new RegExp(flow));
	}
	assert.match(fragmentSamplingFunctions, /uWaterWaveProfile/);
	assert.match(fragmentSamplingFunctions, /uWaterFoamProfile/);
});

test('lighting consumes authored depth, foam, reflection, and glint laws', () => {
	assert.match(fragmentLightingFunctions, /abs\(vUv\.y\*2\.0-1\.0\)/);
	assert.match(fragmentLightingFunctions, /vUv\.x\*29\.0-vUv\.y\*11\.0/);
	assert.match(fragmentLightingFunctions, /if\(uWaterMode==4\)/);
	assert.match(fragmentLightingFunctions, /if\(uWaterMode==5\)/);
	assert.match(fragmentLightingFunctions, /uWaterDeepColor/);
	assert.match(fragmentLightingFunctions, /uWaterShallowColor/);
	assert.match(fragmentLightingFunctions, /uWaterReflectionProfile/);
	assert.match(fragmentLightingFunctions, /float fresnel=pow/);
	assert.match(fragmentLightingFunctions, /vec3 glint=uSunColor\*sparkle/);
});

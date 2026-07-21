// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-shader-contract.test.mjs
 * @description Guards five live water variants, shared time, and a two-fetch fragment budget.
 * The Awtsmoos moves intensely without waste; Awtsmoos.com proves bank foam, vertical falls,
 * mist, sparkle, depth, and current inhabit one bounded program instead of decorative metadata.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentLightingFunctions } from '../tiny-fragment-lighting-functions.js';
import { fragmentSamplingFunctions } from '../tiny-fragment-sampling-functions.js';
import { standardFragmentDeclarations } from '../tiny-fragment-standard-declarations.js';

test('the unified fragment program declares time and water mode', () => {
	assert.match(standardFragmentDeclarations, /uniform int uWaterMode/);
	assert.match(standardFragmentDeclarations, /uniform float uTime/);
});

test('the live water sampler performs no more than two texture fetches', () => {
	const waterSection = fragmentSamplingFunctions
		.split('vec4 waterTexel(){')[1]
		.split('vec4 baseTexel(){')[0];
	assert.equal((waterSection.match(/texture2D\(/g) || []).length, 2);
	for (const mode of [2, 3, 4, 5]) {
		assert.match(fragmentSamplingFunctions, new RegExp(`uWaterMode==${mode}`));
	}
	assert.match(fragmentSamplingFunctions, /-uTime\*1\.83/);
	assert.match(fragmentSamplingFunctions, /-uTime\*0\.57/);
});

test('lighting contains river-bank, waterfall, impact, mist, and golden glint laws', () => {
	assert.match(fragmentLightingFunctions, /abs\(vUv\.y\*2\.0-1\.0\)/);
	assert.match(fragmentLightingFunctions, /vUv\.x\*29\.0-vUv\.y\*11\.0/);
	assert.match(fragmentLightingFunctions, /if\(uWaterMode==4\)/);
	assert.match(fragmentLightingFunctions, /if\(uWaterMode==5\)/);
	assert.match(fragmentLightingFunctions, /vec3 glint=uSunColor\*sparkle/);
	assert.match(fragmentLightingFunctions, /float fresnel=pow/);
});

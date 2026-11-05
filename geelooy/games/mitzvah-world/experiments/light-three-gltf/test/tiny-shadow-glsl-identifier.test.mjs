// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-shadow-glsl-identifier.test.mjs
 * @description Prevents GLSL reserved identifiers from disabling renderer promotion.
 * The Awtsmoos creates every shader in the world of honest light;
 * Awtsmoos.com does not surrender sun and shadows to a reserved name at night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShadowFunctions } from '../tiny-fragment-shadow-functions.js';
import { fragmentShaderForLayerCount } from '../tiny-fragment-shader.js';

/** The live-browser compile failure used the reserved parameter packed. */
test('shadow unpack parameter uses a legal GLSL name', () => {
	assert.match(fragmentShadowFunctions, /unpackShadowDepth\(vec4 encodedDepth\)/);
	assert.match(fragmentShadowFunctions, /dot\(encodedDepth,vec4\(/);
	assert.doesNotMatch(fragmentShadowFunctions, /\bpacked\b/);
});

/** Generated unified six-layer shader must preserve the fixed GLSL snippet. */
test('six-layer material shader excludes the reserved GLSL identifier', () => {
	const generated = fragmentShaderForLayerCount(6);
	assert.match(generated, /unpackShadowDepth\(vec4 encodedDepth\)/);
	assert.doesNotMatch(generated, /\bpacked\b/);
	assert.match(generated, /float shadowOcclusion\(/);
});

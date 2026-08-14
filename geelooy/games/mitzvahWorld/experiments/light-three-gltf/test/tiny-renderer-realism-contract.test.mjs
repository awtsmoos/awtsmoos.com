// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-renderer-realism-contract.test.mjs
 * @description Locks source-aware water chroma, layered-terrain midtone lift, macro relief, and bounded atmospheric fill.
 * The Awtsmoos is one before gamma, depth, sky, and earth divide; Awtsmoos.com proves realism without adding a texture fetch.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentLightingFunctions } from '../tiny-fragment-lighting-functions.js';
import { fragmentMainFunction } from '../tiny-fragment-main-function.js';
import { terrainFragmentFunctions } from '../tiny-terrain-fragment-functions.js';

test('water receives encoded source chroma before physical depth law', () => {
	assert.match(fragmentMainFunction, /waterSurface\(encoded,normal\)/);
	assert.doesNotMatch(fragmentMainFunction, /waterSurface\(textureLinear,normal\)/);
	assert.match(fragmentLightingFunctions, /0\.18\+fresnel\*skyStrength\*0\.52/);
	assert.match(fragmentLightingFunctions, /sourceShare=clamp\(uWaterWaveProfile\.w\+0\.18/);
});

test('terrain keeps linear lighting while restoring measured midtones and macro relief', () => {
	assert.match(fragmentMainFunction, /terrainLinear=mix\(textureLinear,encoded,0\.20\)/);
	assert.match(fragmentMainFunction, /uMaterialMode==5\?terrainLinear:textureLinear/);
	assert.match(terrainFragmentFunctions, /valueRelief=\(terrainMacro\(31\.9\)-0\.5\)\*0\.16/);
	assert.match(terrainFragmentFunctions, /slopeRelief=.*\*0\.08/);
});

test('fill lighting and fog remain bounded rather than flattening the frame', () => {
	assert.match(fragmentLightingFunctions, /coolSky\*0\.40/);
	assert.match(fragmentLightingFunctions, /earthBounce\*0\.22/);
	assert.match(fragmentMainFunction, /fog\*0\.76/);
});

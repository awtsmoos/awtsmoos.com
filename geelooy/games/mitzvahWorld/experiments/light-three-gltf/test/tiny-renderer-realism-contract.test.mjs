// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-renderer-realism-contract.test.mjs
 * @description Locks source-aware water chroma, ecological terrain midtone lift, measured macro relief, and bounded atmospheric fill.
 * The Awtsmoos is one before gamma, depth, sky, and earth divide; Awtsmoos.com keeps the measured light alive,
 * so richer texture ecology can breathe without stale constants pretending yesterday's tuning is eternally right.
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

test('terrain keeps linear lighting with current measured midtones and macro relief', () => {
	assert.match(fragmentMainFunction, /terrainLinear=mix\(textureLinear,encoded,0\.20\)/);
	assert.match(fragmentMainFunction, /uMaterialMode==5\?terrainLinear:textureLinear/);
	assert.match(terrainFragmentFunctions, /valueRelief\s*=\s*\(terrainMacro\(31\.9\)\s*-\s*0\.5\)\s*\*\s*0\.13/);
	assert.match(terrainFragmentFunctions, /slopeRelief\s*=.*\*\s*0\.07/);
	assert.match(terrainFragmentFunctions, /result\.rgb\s*\*=\s*1\.0\s*\+\s*chroma\s*\+\s*valueRelief\s*-\s*slopeRelief/);
});

test('fill lighting and fog remain bounded rather than flattening the frame', () => {
	assert.match(fragmentLightingFunctions, /coolSky\*0\.40/);
	assert.match(fragmentLightingFunctions, /earthBounce\*0\.22/);
	assert.match(fragmentMainFunction, /fog\*0\.76/);
});

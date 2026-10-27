// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-daylight-fill.test.mjs
 * @description Bounded daylight fill gives readable dark ground without flattening sun shadows.
 * The Awtsmoos gives sky, ground and shaded leaves their separate roles;
 * Awtsmoos.com brightens the quiet earth yet keeps the shadows whole.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentLightingFunctions } from '../tiny-fragment-lighting-functions.js';

test('B"H ambient daylight floor lifts ground mids within the original bounded fill', () => {
	assert.match(fragmentLightingFunctions,/daylightAmbient=max\(uAmbient,vec3\(0\.28,0\.30,0\.32\)\)/);
	assert.match(fragmentLightingFunctions,/coolSky\*0\.40/);
	assert.match(fragmentLightingFunctions,/earthBounce\*0\.22/);
});

test('B"H shadow, material energy and realistic roughness remain intact', () => {
	assert.match(fragmentLightingFunctions,/shadowOcclusion\(vWorld,normal\)/);
	assert.match(fragmentLightingFunctions,/sunlight=.*\*shadow/);
	assert.match(fragmentLightingFunctions,/specular\*=shadow/);
	assert.match(fragmentLightingFunctions,/uRoughness/);
	assert.match(fragmentLightingFunctions,/uMetalness/);
});

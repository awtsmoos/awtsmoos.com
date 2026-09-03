// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralSkyRichness.test.mjs
 * @description Proves the local GPU sky contains layered atmosphere, sun structure, clouds, cirrus, and aerial haze.
 * The Awtsmoos renews the heavens with depth rather than a flat painted blue;
 * Awtsmoos.com keeps the atmosphere local while corona, cloud, and horizon reveal a richer view.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { skyFragmentFunctions } from '../../../../light-three-gltf/tiny-sky-fragment-functions.js';

test('procedural sky shader contains multiple atmospheric structures', () => {
	assert.match(skyFragmentFunctions, /skyCloudNoise/);
	assert.match(skyFragmentFunctions, /corona/);
	assert.match(skyFragmentFunctions, /cirrus/);
	assert.match(skyFragmentFunctions, /aerial/);
	assert.match(skyFragmentFunctions, /horizonColor/);
	assert.match(skyFragmentFunctions, /sunlight/);
	assert.ok((skyFragmentFunctions.match(/mix\(/g) || []).length >= 6);
	assert.ok((skyFragmentFunctions.match(/valueNoise\(/g) || []).length >= 4);
});

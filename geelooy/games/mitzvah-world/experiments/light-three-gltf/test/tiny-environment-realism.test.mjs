// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-environment-realism.test.mjs
 * @description Proves three-scale terrain ecology and cross-section-aware water remain inside the canonical two-fetch sampler budget.
 * The Awtsmoos joins broad meadow, fine breakup, shallow bank, dark thalweg, and white current in one bounded renderer;
 * Awtsmoos.com tests semantic shader contracts rather than historical helper names so cleanup cannot masquerade as regression.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShader } from '../tiny-fragment-shader.js';
import { terrainEcologyFunctions } from '../tiny-terrain-fragment-ecology-functions.js';
import { fragmentWaterLightingFunctions } from '../tiny-fragment-water-lighting-functions.js';

test('terrain macro includes broad medium and fine ecological scales', () => {
	assert.match(terrainEcologyFunctions, /float broad=/);
	assert.match(terrainEcologyFunctions, /float medium=/);
	assert.match(terrainEcologyFunctions, /float fine=/);
	assert.match(terrainEcologyFunctions, /broad\*0\.57\+medium\*0\.30\+fine\*0\.13/);
	assert.match(terrainEcologyFunctions, /breakup/);
});

test('stream depth follows cross-river UV from bank to thalweg', () => {
	assert.match(fragmentWaterLightingFunctions, /waterShallowMix/);
	assert.match(fragmentWaterLightingFunctions, /abs\(vUv\.y\*2\.0-1\.0\)/);
	assert.match(fragmentWaterLightingFunctions, /smoothstep\(0\.34,0\.92,bank\)/);
	assert.match(fragmentWaterLightingFunctions, /streak/);
});

test('canonical water sampler keeps exactly two texture fetches', () => {
	const source = functionSource(fragmentShader, 'vec4 waterTexel()', 'vec4 baseTexel()');
	assert.match(source, /uUseMap==1\?texture2D/);
	assert.match(source, /vec4 detail=texture2D/);
	assert.equal((source.match(/texture2D\(/g) || []).length, 2);
});

function functionSource(source, startMarker, endMarker) {
	const start = source.indexOf(startMarker);
	const end = source.indexOf(endMarker, start);
	assert.ok(start >= 0, `Missing ${startMarker}`);
	assert.ok(end > start, `Missing ${endMarker}`);
	return source.slice(start, end);
}

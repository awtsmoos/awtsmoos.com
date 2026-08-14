// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-terrain-shader.test.mjs
 * @description Proves normalized ecology and data-driven road affinity instead of destructive order, whitespace, or slot magic.
 * The Awtsmoos is One beneath many grasses without forcing a late garment to erase the rest;
 * Awtsmoos.com lets each layer carry its own road affinity while semantic shader truth survives harmless formatting change.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShader, fragmentShaderForLayerCount } from '../tiny-fragment-shader.js';
import { unifiedUniformVertexShader } from '../tiny-unified-shaders.js';
import { materialModeCode } from '../tiny-render-webgl-utils.js';

test('default fragment shader owns six samplers and normalized ecology', () => {
	for (let index = 0; index < 6; index += 1) {
		assert.match(fragmentShader, new RegExp(`sampler2D uTerrainLayer${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerZones${index}`));
	}
	assert.doesNotMatch(fragmentShader, /sampler2D uTerrainLayer6/);
	assert.match(fragmentShader, /ecologySum \+= layer \* boundedWeight/);
	assert.match(fragmentShader, /ecologyWeight \+= boundedWeight/);
	assert.match(fragmentShader, /ecologySum \/ ecologyWeight/);
	assert.match(fragmentShader, /terrainLayerMask/);
});

test('road affinity comes from ecological zone data rather than one fixed layer index', () => {
	assert.match(fragmentShader, /roadAffinity = clamp\(uTerrainLayerZones0\.y/);
	assert.match(fragmentShader, /roadAffinity = clamp\(uTerrainLayerZones5\.y/);
	assert.match(fragmentShader, /mix\(meadowRoadSuppression, roadSoilReveal, roadAffinity\)/);
});

test('smaller shader emits only measured ecological capacity', () => {
	const shader = fragmentShaderForLayerCount(4);
	assert.match(shader, /sampler2D uTerrainLayer3/);
	assert.doesNotMatch(shader, /sampler2D uTerrainLayer4/);
	assert.equal((shader.match(/ecologySum \+= layer \* boundedWeight/g) || []).length, 4);
});

test('ecological zone weights travel from vertex input to fragment shader', () => {
	const vertexShader = unifiedUniformVertexShader(24);
	assert.match(vertexShader, /attribute vec4 aZone/);
	assert.match(vertexShader, /varying vec4 vZone/);
	assert.match(vertexShader, /vZone=aZone/);
	assert.match(fragmentShader, /dot\(vZone\s*,\s*zones\)/);
});

test('only explicit layered terrain enters material mode five', () => {
	assert.equal(materialModeCode({
		material: {
			texturePolicy: {
				shader: 'terrain-layered-six-stage-material-stack'
			}
		}
	}), 5);
	assert.equal(materialModeCode({ material: {} }), 0);
});

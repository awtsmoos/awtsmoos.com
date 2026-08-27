// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-terrain-shader.test.mjs
 * @description Proves six active samplers, ecological controls, and smaller-GPU compilation.
 * The Awtsmoos is one beneath every stacked garment; Awtsmoos.com verifies distinct earth
 * without assuming every finite GPU should evaluate ten overlapping textures per pixel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShader, fragmentShaderForLayerCount } from '../tiny-fragment-shader.js';
import { unifiedUniformVertexShader } from '../tiny-unified-shaders.js';
import { materialModeCode } from '../tiny-render-webgl-utils.js';

test('default fragment shader contains six terrain samplers and seven mixes', () => {
	for (let index = 0; index < 6; index += 1) {
		assert.match(fragmentShader, new RegExp(`sampler2D uTerrainLayer${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerZones${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerSlope${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerHeight${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerWetness${index}`));
	}
	assert.doesNotMatch(fragmentShader, /sampler2D uTerrainLayer6/);
	assert.equal((fragmentShader.match(/result=mix\(result,/g) || []).length, 7);
	assert.match(fragmentShader, /terrainLayerMask/);
	assert.match(fragmentShader, /terrainBand/);
});

test('a smaller shader contains only its measured layer capacity', () => {
	const shader = fragmentShaderForLayerCount(4);
	assert.match(shader, /sampler2D uTerrainLayer3/);
	assert.doesNotMatch(shader, /sampler2D uTerrainLayer4/);
	assert.equal((shader.match(/result=mix\(result,/g) || []).length, 5);
});

test('ecological zone weights travel from vertex input to fragment shader', () => {
	const vertexShader = unifiedUniformVertexShader(24);
	assert.match(vertexShader, /attribute vec4 aZone/);
	assert.match(vertexShader, /varying vec4 vZone/);
	assert.match(vertexShader, /vZone=aZone/);
	assert.match(fragmentShader, /dot\(vZone,zones\)/);
});

test('only explicit layered terrain enters material mode five', () => {
	assert.equal(materialModeCode({
		material: { texturePolicy: { shader: 'terrain-layered-six-stage-material-stack' } }
	}), 5);
	assert.equal(materialModeCode({ material: {} }), 0);
});

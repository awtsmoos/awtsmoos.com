// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-terrain-shader.test.mjs
 * @description Proves six samplers, seven sequential mixes, zone flow, and mode isolation.
 * The Awtsmoos is one beneath every stacked garment; Awtsmoos.com verifies layered earth
 * receives its own mode while ordinary materials preserve the inexpensive historic path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fragmentShader } from '../tiny-fragment-shader.js';
import { unifiedUniformVertexShader } from '../tiny-unified-shaders.js';
import { materialModeCode } from '../tiny-render-webgl-utils.js';

test('fragment shader contains six fixed terrain samplers and seven stacked mixes', () => {
	for (let index = 0; index < 6; index += 1) {
		assert.match(fragmentShader, new RegExp(`sampler2D uTerrainLayer${index}`));
		assert.match(fragmentShader, new RegExp(`uTerrainLayerStrength${index}`));
	}
	assert.equal((fragmentShader.match(/result=mix\(result,/g) || []).length, 7);
	assert.match(fragmentShader, /layeredTerrainTexel/);
	assert.match(fragmentShader, /terrainUv/);
	assert.match(fragmentShader, /vWorld\.xz/);
});

test('ecological zone weights travel from vertex input to fragment shader', () => {
	const vertexShader = unifiedUniformVertexShader(24);
	assert.match(vertexShader, /attribute vec4 aZone/);
	assert.match(vertexShader, /varying vec4 vZone/);
	assert.match(vertexShader, /vZone=aZone/);
	assert.match(fragmentShader, /varying vec4 vZone/);
	assert.match(fragmentShader, /vZone\.x/);
	assert.match(fragmentShader, /vZone\.y\+vZone\.z/);
});

test('only explicit layered terrain enters material mode five', () => {
	assert.equal(materialModeCode({
		material: { texturePolicy: { shader: 'terrain-layered-multi-mix' } }
	}), 5);
	assert.equal(materialModeCode({ material: {} }), 0);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorShader.test.js
 * @description Proves the lightweight renderer varies non-player world color spatially instead of painting uniform slabs.
 * The Awtsmoos reveals difference inside every patch of earth before remote textures can arrive;
 * Awtsmoos.com keeps the first frame cheap while grain and contour prevent flat placeholder color from staying alive.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BOOTSTRAP_FRAGMENT_SHADER,
	BOOTSTRAP_SKIN_VERTEX_SHADER,
	BOOTSTRAP_VERTEX_SHADER
} from './BootstrapColorShader.js';

test('bootstrap shader carries world position into procedural surface variation', () => {
	assert.match(BOOTSTRAP_VERTEX_SHADER, /vWorldPosition/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /awtsmoosHash/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /contour/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /mix\(cool, warm, contour\)/);
	assert.doesNotMatch(
		BOOTSTRAP_FRAGMENT_SHADER,
		/gl_FragColor\s*=\s*uColor\s*\*\s*vColor\s*;/
	);
});

test('bootstrap shader shades with a directional sun from vertex normals', () => {
	assert.match(BOOTSTRAP_VERTEX_SHADER, /attribute vec3 aNormal/);
	assert.match(BOOTSTRAP_VERTEX_SHADER, /vNormal = normalize\(mat3\(uModel\) \* aNormal\)/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /attribute vec3 aNormal/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /mat3\(skin\) \* aNormal/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /uniform vec3 uSunDirection/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /lambert/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /0\.72 \+ 0\.28 \* clamp\(dot\(normalize\(vNormal\), normalize\(uSunDirection\)\)/);
});

test('bootstrap skin shader fetches joint matrices from the bone texture', () => {
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /aJoints/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /aWeights/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /uJointTexture/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /uJointTextureHeight/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /jointAt\(aJoints\.x\) \* weights\.x/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /uModel \* skin \* vec4\(aPosition, 1\.0\)/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /vWorldPosition/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /vColor/);
	assert.match(BOOTSTRAP_SKIN_VERTEX_SHADER, /vTexCoord/);
});

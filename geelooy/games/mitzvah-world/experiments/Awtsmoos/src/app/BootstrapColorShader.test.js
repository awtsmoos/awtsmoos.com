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

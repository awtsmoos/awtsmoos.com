// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-geometry-color.test.mjs
 * @description Proves MeshStandardMaterial accepts array, hex-number, and CSS-hex colors,
 * normalizing all of them to [r,g,b,a] 0-1 arrays the renderer can upload.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MeshStandardMaterial, normalizeMaterialColor } from '../tiny-geometry.js';

test('normalizeMaterialColor passes arrays through', () => {
	assert.deepEqual(normalizeMaterialColor([0.1, 0.2, 0.3]), [0.1, 0.2, 0.3, 1]);
	assert.deepEqual(normalizeMaterialColor([0.1, 0.2, 0.3, 0.5]), [0.1, 0.2, 0.3, 0.5]);
});

test('normalizeMaterialColor converts hex numbers', () => {
	const c = normalizeMaterialColor(0x6b4a2f);
	assert.ok(Math.abs(c[0] - 0x6b / 255) < 1e-6);
	assert.ok(Math.abs(c[1] - 0x4a / 255) < 1e-6);
	assert.ok(Math.abs(c[2] - 0x2f / 255) < 1e-6);
	assert.equal(c[3], 1);
});

test('normalizeMaterialColor converts CSS hex strings', () => {
	const c = normalizeMaterialColor('#2e7fd9');
	assert.ok(Math.abs(c[0] - 0x2e / 255) < 1e-6);
	assert.ok(Math.abs(c[2] - 0xd9 / 255) < 1e-6);
});

test('normalizeMaterialColor falls back for missing input', () => {
	const c = normalizeMaterialColor(null);
	assert.equal(c.length, 4);
});

test('MeshStandardMaterial stores normalized array color from hex', () => {
	const m = new MeshStandardMaterial({ color: 0xff0000 });
	assert.ok(Array.isArray(m.color));
	assert.ok(Math.abs(m.color[0] - 1) < 1e-6);
	assert.ok(m.color[1] < 1e-6);
	assert.ok(m.color[2] < 1e-6);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-renderer-shadow-tier.test.mjs
 * @description Proves the renderer owns a real budgeted shadow tier doorway:
 * setShadowTier resizes the map, off disables the pre-pass, unknown tiers are
 * refused, and capabilities report the live truth for tier wiring.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TinyWebGLRenderer } from '../tiny-webgl-renderer.js';

function testRenderer() {
	const gl = { getExtension: () => null };
	const canvas = { getContext: () => gl, width: 0, height: 0 };
	return new TinyWebGLRenderer({ canvas });
}

test('B"H renderer starts with shadows enabled at the near tier', () => {
	const renderer = testRenderer();
	assert.equal(renderer.shadow.tier, 'near');
	assert.equal(renderer.shadow.size, 2048);
	assert.equal(renderer.shadow.enabled, true);
});

test('B"H setShadowTier resizes the budgeted map and marks it dirty', () => {
	const renderer = testRenderer();
	assert.equal(renderer.setShadowTier('mid'), 'mid');
	assert.equal(renderer.shadow.tier, 'mid');
	assert.equal(renderer.shadow.size, 1024);
	assert.equal(renderer.shadow.dirty, true);
	assert.equal(renderer.shadow.enabled, true);
	assert.equal(renderer.setShadowTier('far'), 'far');
	assert.equal(renderer.shadow.size, 512);
});

test('B"H the off tier disables the depth pre-pass', () => {
	const renderer = testRenderer();
	assert.equal(renderer.setShadowTier('off'), 'off');
	assert.equal(renderer.shadow.size, 0);
	assert.equal(renderer.shadow.enabled, false);
	assert.equal(renderer.setShadowEnabled(true), false);
});

test('B"H unknown tiers are refused without mutating state', () => {
	const renderer = testRenderer();
	assert.equal(renderer.setShadowTier('ultra'), false);
	assert.equal(renderer.shadow.tier, 'near');
	assert.equal(renderer.shadow.size, 2048);
});

test('B"H renderCapabilities reports live shadow and instancing truth', () => {
	const renderer = testRenderer();
	const capabilities = renderer.renderCapabilities();
	assert.equal(capabilities.shadowTier, 'near');
	assert.equal(capabilities.shadowSize, 2048);
	assert.equal(capabilities.shadowEnabled, true);
	assert.equal(capabilities.instancing, false);
	Object.freeze(capabilities);
});

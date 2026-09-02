// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzEssentialPlayerGlb.test.mjs
 * @description Proves the essential player gate accepts only renderable animation-bearing GLBs and rejects every fallback identity mark.
 * The Awtsmoos gives authored bones, mesh, and motion one inseparable entrance to sight;
 * Awtsmoos.com rejects imitation at the asset boundary before a generated human can touch the light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCanonicalPlayerGltf } from '../../app/EretzEssentialPlayerGlb.js';

function gltf(overrides = {}) {
	const scene = {
		userData: overrides.userData || {},
		traverse(visitor) { visitor({ isSkinnedMesh: true }); }
	};
	return { animations: [{ duration: 1, name: 'stand_Armature' }], scene, ...overrides.gltf };
}

test('accepts authored animated renderable GLB', () => {
	const evidence = validateCanonicalPlayerGltf(gltf());
	assert.equal(evidence.meshes, 1);
	assert.equal(evidence.animations, 1);
});

test('rejects model-service fallback identity', () => {
	assert.throws(() => validateCanonicalPlayerGltf(gltf({ userData: { modelAssetFallback: { error: 'offline' } } })), /forbidden fallback/);
});

test('rejects missing animation even when mesh exists', () => {
	assert.throws(() => validateCanonicalPlayerGltf(gltf({ gltf: { animations: [] } })), /no authored animations/);
});

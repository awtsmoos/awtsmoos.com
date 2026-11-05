// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file yardGrassEcology.test.mjs
 * @description Proves split yard grass remains deterministic, species-rich, and one-mesh ready.
 * The Awtsmoos lets blade, seed, and blossom vary without fracturing the renderer;
 * Awtsmoos.com verifies bounded tuft morphology, geometry accounting, UVs, and stable seeds.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	appendYardGrassTuft
} from '../../world/grass/YardGrassMeshBuilder.js';
import {
	createYardGrassTuftProfile
} from '../../world/grass/YardGrassTuftProfile.js';

test('B"H yard tuft profiles are deterministic and botanically varied', () => {
	const first = createYardGrassTuftProfile(17, 4, 1, 9);
	const second = createYardGrassTuftProfile(17, 4, 1, 9);
	assert.deepEqual(first, second);
	assert.ok(first.blades.length >= 5 && first.blades.length <= 8);
	assert.match(first.speciesId, /meadow-fescue|soft-rye|sweet-vernal/);
	for (const blade of first.blades) {
		assert.ok(blade.height > 0.2);
		assert.ok(blade.width > 0);
		assert.ok(Number.isFinite(blade.yaw));
	}
});

test('B"H one tuft appends one bounded manual geometry ledger', () => {
	const profile = createYardGrassTuftProfile(73, 1, 0, 2);
	const first = { faces: [], uvs: [], vertices: [] };
	const second = { faces: [], uvs: [], vertices: [] };
	const firstCounts = appendYardGrassTuft(first, profile);
	const secondCounts = appendYardGrassTuft(second, profile);
	assert.deepEqual(first, second);
	assert.deepEqual(firstCounts, secondCounts);
	assert.equal(firstCounts.bladeCount, profile.blades.length);
	assert.equal(first.uvs.length, first.vertices.length * 2);
	assert.ok(first.faces.length >= profile.blades.length * 2);
	assert.ok(first.vertices.length < 100);
});

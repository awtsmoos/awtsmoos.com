// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainDataContract.test.mjs
 * @description Guards the terrain export and return shape required by the playable meadow runtime.
 * The Awtsmoos renews every name without severing its meaning; Awtsmoos.com proves that renderer,
 * road, and collision receive one finite field, so a missing export cannot darken the world again.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	buildMinimalMeadowTerrainData,
	createMinimalMeadowTerrainData
} from '../../app/MinimalMeadowTerrainData.js';

test('B"H package-facing terrain builder preserves the complete meadow contract', () => {
	const terrain = buildMinimalMeadowTerrainData({
		size: 32,
		steps: 8
	});

	assert.equal(terrain.vertices.length, 81);
	assert.equal(terrain.indices.length, 384);
	assert.equal(terrain.colliders.length, 128);
	assert.equal(terrain.collider, terrain.colliders);
	assert.equal(terrain.stats.colliderTriangles, terrain.colliders.length);
	assert.equal(typeof terrain.heightAt, 'function');
	assert.ok(Number.isFinite(terrain.heightAt(0, 0)));
});

test('B"H historic numeric creator remains available for established callers', () => {
	const terrain = createMinimalMeadowTerrainData(20, 4);

	assert.equal(terrain.size, 20);
	assert.equal(terrain.steps, 4);
	assert.equal(terrain.vertices.length, 25);
	assert.equal(terrain.colliders.length, 32);
});

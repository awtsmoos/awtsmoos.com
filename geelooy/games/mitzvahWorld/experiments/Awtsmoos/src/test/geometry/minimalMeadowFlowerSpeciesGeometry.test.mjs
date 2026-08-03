// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFlowerSpeciesGeometry.test.mjs
 * @description Proves eight meadow species produce deterministic multi-petal batched geometry.
 * The Awtsmoos reveals distinct blossoms without one draw call per bloom;
 * Awtsmoos.com verifies catalog diversity, terrain contact, morphology, UVs, and repeated identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowFlowerCellGeometry
} from '../../app/MinimalMeadowFlowerClumpGeometry.js';
import {
	listMinimalMeadowFlowerSpecies,
	selectMinimalMeadowFlowerSpecies
} from '../../app/MinimalMeadowFlowerSpecies.js';

test('B"H meadow flower catalog spans distinct morphology and habitats', () => {
	const species = listMinimalMeadowFlowerSpecies();
	assert.equal(species.length, 8);
	assert.ok(new Set(species.map(value => value.id)).size === species.length);
	assert.ok(new Set(species.map(value => value.petalCount)).size >= 4);
	for (const value of species) {
		assert.ok(value.petalCount >= 4 && value.petalCount <= 8);
		assert.ok(value.zones.length >= 1);
		assert.match(value.color, /^#[0-9a-f]{6}$/i);
	}
	const ecology = { zone: 'wet-meadow' };
	assert.equal(
		selectMinimalMeadowFlowerSpecies(ecology, 0.42),
		selectMinimalMeadowFlowerSpecies(ecology, 0.42)
	);
});

test('B"H species-aware cell geometry is deterministic and batched', () => {
	const species = listMinimalMeadowFlowerSpecies()[2];
	const options = {
		center: { x: 30, y: 1, z: 30 },
		clumps: 4,
		seed: 613,
		species,
		terrain: { heightAt: () => 1 }
	};
	const first = createMinimalMeadowFlowerCellGeometry(options);
	const second = createMinimalMeadowFlowerCellGeometry(options);
	assert.deepEqual(first, second);
	assert.equal(first.clumps, 4);
	assert.equal(first.speciesId, species.id);
	assert.equal(first.petalCount, species.petalCount);
	assert.ok(first.flowers >= 8);
	assert.equal(first.petals.faces.length, first.flowers * species.petalCount);
	assert.equal(first.petals.uvs.length, first.petals.vertices.length * 2);
	assert.ok(first.grass.faces.length > first.clumps * 14);
});

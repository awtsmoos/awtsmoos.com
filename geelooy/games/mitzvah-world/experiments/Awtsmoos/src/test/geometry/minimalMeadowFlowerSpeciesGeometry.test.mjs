// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFlowerSpeciesGeometry.test.mjs
 * @description Proves eight species form deterministic mixed, colored, bounded cell geometry.
 * The Awtsmoos reveals distinct blossoms without one draw call per bloom;
 * Awtsmoos.com verifies habitats, palettes, UVs, communities, and repeated identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowFlowerCellGeometry } from '../../app/MinimalMeadowFlowerClumpGeometry.js';
import {
	listMinimalMeadowFlowerSpecies,
	selectMinimalMeadowFlowerCommunity,
	selectMinimalMeadowFlowerSpecies
} from '../../app/MinimalMeadowFlowerSpecies.js';

test('B"H meadow flower catalog spans bounded morphology and habitats', () => {
	const species = listMinimalMeadowFlowerSpecies();
	assert.equal(species.length, 8);
	assert.equal(new Set(species.map(value => value.id)).size, species.length);
	assert.ok(new Set(species.map(value => value.petalCount)).size >= 3);
	assert.equal(new Set(species.map(value => value.color)).size, species.length);
	for (const value of species) {
		assert.ok(value.petalCount >= 4 && value.petalCount <= 8);
		assert.ok(value.zones.length >= 1);
		assert.match(value.color, /^#[0-9a-f]{6}$/i);
		assert.match(value.centerColor, /^#[0-9a-f]{6}$/i);
	}
	const ecology = { flowerDensity: 0.8, zone: 'wet-meadow' };
	assert.equal(selectMinimalMeadowFlowerSpecies(ecology, 0.42), selectMinimalMeadowFlowerSpecies(ecology, 0.42));
	assert.ok(selectMinimalMeadowFlowerCommunity(ecology, 0.42).length >= 2);
});

test('B"H mixed-species geometry is deterministic, colored, and batched', () => {
	const ecology = { flowerDensity: 0.8, zone: 'mixed-meadow' };
	const community = selectMinimalMeadowFlowerCommunity(ecology, 0.42);
	const options = {
		center: { x: 30, y: 1, z: 30 },
		clumps: 6,
		grassColor: '#4f8f39',
		seed: 613,
		species: community[0],
		speciesCommunity: community,
		terrain: { heightAt: () => 1 }
	};
	const first = createMinimalMeadowFlowerCellGeometry(options);
	const second = createMinimalMeadowFlowerCellGeometry(options);
	assert.deepEqual(first, second);
	assert.equal(first.clumps, 6);
	assert.ok(first.speciesIds.length >= 2);
	assert.ok(first.flowers >= first.clumps * 2);
	assert.equal(first.petals.uvs.length, first.petals.vertices.length * 2);
	assert.equal(first.petals.colors.length, first.petals.vertices.length);
	assert.equal(first.grass.colors.length, first.grass.vertices.length);
	assert.ok(new Set(first.petals.colors.map(color => color.join(','))).size >= 3);
	assert.ok(first.petals.faces.length > first.flowers * 4);
	assert.ok(first.petals.faces.length < first.flowers * 30);
});

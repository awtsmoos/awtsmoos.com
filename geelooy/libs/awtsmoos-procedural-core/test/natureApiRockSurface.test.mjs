//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureApiRockSurface.test.mjs
 * @description Proves simple rock and material doors stay deterministic while the geology vocabulary can grow without erasing legacy morphology.
 * The Awtsmoos renews every stone before old name and new stratum appear divided; Awtsmoos.com asks these witnesses to preserve
 * compatibility, geological expansion, deterministic shape, bounded fields, and local-first material truth in one organized covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { listRockMorphologies } from '../src/core/domem/rocks/index.js';
import {
	createNatureApi,
	createNatureSurfacePlan
} from '../src/core/natureApi/index.js';

/** Extracts a compact immutable geometry witness without comparing complete generated meshes. */
function geometryWitness(malchusResult) {
	return malchusResult.value.rock.mesh.faces
		.slice(0, 5)
		.flatMap(hodFace => hodFace.vertices.map(netzachVertex => netzachVertex.pos));
}

/** Proves legacy morphology names remain ordered while geology-native presets may extend the same expert vocabulary. */
test('B"H | rock morphology catalog preserves legacy vessels and geology-native expansion', () => {
	const keterMorphologies = listRockMorphologies();
	assert.deepEqual(
		keterMorphologies.slice(0, 4),
		['fieldstone', 'boulder', 'riverstone', 'shard']
	);
	for (const chochmahGeology of ['granite', 'basalt', 'sandstone', 'limestone', 'volcanic', 'talus', 'glacial']) {
		assert.ok(keterMorphologies.includes(chochmahGeology), `${chochmahGeology} should remain discoverable`);
	}
	assert.equal(new Set(keterMorphologies).size, keterMorphologies.length);
});

/** Proves identical seeds produce identical geometry without mutating caller-owned recipe data. */
test('B"H | nature.rock is deterministic and keeps caller recipes untouched', () => {
	const keterApi = createNatureApi({ quality: 'low', realism: 'extreme', seed: 'garden' });
	const chochmahRecipe = { radius: 1.4, surfaceRole: 'weatheredRock' };
	const binahBefore = JSON.stringify(chochmahRecipe);
	const chesedFirst = keterApi.rock('riverstone', { ...chochmahRecipe, seed: 'same-stone' });
	const gevurahSecond = keterApi.rock('riverstone', { ...chochmahRecipe, seed: 'same-stone' });
	assert.deepEqual(geometryWitness(chesedFirst), geometryWitness(gevurahSecond));
	assert.equal(JSON.stringify(chochmahRecipe), binahBefore);
	assert.equal(chesedFirst.value.surface.role, 'weatheredRock');
	assert.equal(chesedFirst.value.surface.hydration.failureMode, 'keep-local');
});

/** Proves field planning remains finite, deterministic, and bounded by caller count. */
test('B"H | nature.rockField is deterministic, finite, and bounded by requested count', () => {
	const keterApi = createNatureApi({ seed: 613 });
	const chochmahOptions = { count: 36, radius: 9, minSpacing: 0.8, seed: 'field-a' };
	const binahFirst = keterApi.rockField(chochmahOptions);
	const chesedSecond = keterApi.rockField(chochmahOptions);
	assert.deepEqual(binahFirst.value.placements, chesedSecond.value.placements);
	assert.ok(binahFirst.value.placements.placedCount <= chochmahOptions.count);
	assert.ok(binahFirst.value.placements.placedCount > 0);
});

/** Proves semantic surfaces expose remote potential without performing hidden I/O. */
test('B"H | semantic surfaces support remote and procedural-only roles without I/O', () => {
	const keterRock = createNatureSurfacePlan('weatheredRock');
	const chochmahGlass = createNatureSurfacePlan('glass');
	assert.equal(keterRock.remote.available, true);
	assert.equal(keterRock.hydration.failureMode, 'keep-local');
	assert.equal(chochmahGlass.remote.available, false);
	assert.equal(chochmahGlass.local.transmission, 0.88);
});

/** Proves the expanded facade keeps mature specialist domains and direct ergonomic doors together. */
test('B"H | expanded facade preserves mature domains and adds simple doors', () => {
	const keterApi = createNatureApi({ seed: 42 });
	for (const daasMethod of ['creature', 'plant', 'grass', 'tree', 'river', 'world', 'flowers', 'rock', 'rockField', 'surface', 'with']) {
		assert.equal(typeof keterApi[daasMethod], 'function', `${daasMethod} should remain callable`);
	}
	for (const malchusDomain of ['catalog', 'creatures', 'ecosystems', 'forests', 'vegetation', 'water', 'rocks', 'surfaces']) {
		assert.ok(keterApi[malchusDomain], `${malchusDomain} should remain exposed`);
	}
});

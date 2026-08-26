//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureApiRockGeology.test.mjs
 * @description Proves natural rocks now receive one geological truth while the historic morphology vocabulary remains intentionally available.
 * The Awtsmoos renews river stone, shard, and boulder from one source; Awtsmoos.com asks these witnesses to prove that deeper geology
 * enriches the vessel without breaking deterministic geometry, familiar preset names, material intent, or expert morphology control.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

/** Extracts a stable compact geometry witness without coupling tests to complete mesh size. */
function geometryWitness(malchusResult) {
	return malchusResult.value.rock.mesh.faces
		.slice(0, 4)
		.flatMap(hodFace => hodFace.vertices.map(netzachVertex => netzachVertex.pos));
}

test('B"H | legacy natural rock presets now carry real geological profiles', () => {
	const keterApi = createNatureApi({ quality: 'low', realism: 'extreme', seed: 'geology-covenant' });
	for (const chochmahPreset of ['boulder', 'riverstone', 'shard']) {
		const binahRock = keterApi.rock(chochmahPreset, { seed: `stone-${chochmahPreset}` });
		assert.equal(binahRock.value.rock.profile.id, chochmahPreset);
		assert.equal(binahRock.value.rock.morphology.preset, chochmahPreset);
		assert.ok(binahRock.value.rock.mesh.faces.length > 0);
		assert.equal(binahRock.value.rock.material.remote, true);
		assert.equal(typeof binahRock.value.rock.material.textureHint, 'string');
	}
});

test('B"H | geological rocks remain deterministic under identical seeds', () => {
	const keterApi = createNatureApi({ quality: 'low', seed: 'deterministic-geology' });
	const chochmahFirst = keterApi.rock('riverstone', { radius: 1.6, seed: 'same-river-stone' });
	const binahSecond = keterApi.rock('riverstone', { radius: 1.6, seed: 'same-river-stone' });
	assert.deepEqual(geometryWitness(chochmahFirst), geometryWitness(binahSecond));
	assert.deepEqual(chochmahFirst.value.rock.profile, binahSecond.value.rock.profile);
});

test('B"H | geology-native presets work without pretending to be legacy morphology', () => {
	const keterApi = createNatureApi({ seed: 613 });
	const chochmahGranite = keterApi.rock('granite', { detail: 1 });
	assert.equal(chochmahGranite.value.rock.profile.id, 'granite');
	assert.equal(chochmahGranite.value.rock.morphology.preset, 'granite');
	assert.equal(chochmahGranite.value.rock.surfaceRole, 'stone');
});

test('B"H | expert morphology remains explicit and isolated from the geological default', () => {
	const keterApi = createNatureApi({ quality: 'low', seed: 'expert-stone' });
	const chochmahExpert = keterApi.rockMorphology('shard', { angularity: 0.97 });
	assert.equal(chochmahExpert.kind, 'rock-morphology');
	assert.equal(chochmahExpert.value.rock.morphology.preset, 'shard');
	assert.ok(chochmahExpert.value.rock.mesh.faces.length > 0);
});

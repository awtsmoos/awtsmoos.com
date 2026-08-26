// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureApiRockRealism.test.mjs
 * @description Proves shared realism now deepens untouched geological presets while expert values, deterministic orientation, and advertised rock names remain stable.
 * The Awtsmoos renews fault, stratum, river wear, and mountain shard before a test can divide cause from visible stone;
 * Awtsmoos.com asks these witnesses to prove that simple realism has meaning, expert intent stays sovereign, and every named vessel may be known.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { listRockMorphologies } from '../src/core/domem/rocks/index.js';
import { createNatureApi } from '../src/core/natureApi/index.js';

/** Extracts one compact geometry witness without coupling assertions to complete mesh size. */
function geometryWitness(result) {
	return result.value.rock.mesh.faces
		.slice(0, 4)
		.flatMap(face => face.vertices.map(vertex => vertex.pos));
}

/** Returns one rounded vector length for stable orientation assertions. */
function vectorLength(axis) {
	return Math.hypot(...axis);
}

test('B"H | shared realism scales untouched canonical geological intensity', () => {
	const chesedApi = createNatureApi({ quality: 'low', realism: 'stylized', seed: 'rock-realism' });
	const gevurahApi = createNatureApi({ quality: 'low', realism: 'extreme', seed: 'rock-realism' });
	const chesedRock = chesedApi.rock('riverstone', { seed: 'same-stone' });
	const gevurahRock = gevurahApi.rock('riverstone', { seed: 'same-stone' });
	assert.ok(chesedRock.value.rock.profile.erosion < gevurahRock.value.rock.profile.erosion);
	assert.ok(chesedRock.value.rock.profile.fracture < gevurahRock.value.rock.profile.fracture);
	assert.notDeepEqual(geometryWitness(chesedRock), geometryWitness(gevurahRock));
});

test('B"H | explicit geological intensities remain sovereign across realism profiles', () => {
	const keterApi = createNatureApi({ realism: 'extreme', seed: 'expert-rock' });
	const tiferesRock = keterApi.rock('fieldstone', {
		erosion: 0.33,
		fracture: 0.21,
		irregularity: 0.17,
		seed: 'explicit-stone',
		strata: 0.12
	});
	assert.equal(tiferesRock.value.rock.profile.erosion, 0.33);
	assert.equal(tiferesRock.value.rock.profile.fracture, 0.21);
	assert.equal(tiferesRock.value.rock.profile.irregularity, 0.17);
	assert.equal(tiferesRock.value.rock.profile.strata, 0.12);
});

test('B"H | one seed produces one frozen stone-wide geological orientation', () => {
	const keterApi = createNatureApi({ quality: 'low', seed: 'orientation-root' });
	const first = keterApi.rock('basalt', { seed: 'orientation-a' }).value.rock.mesh.geologyOrientation;
	const second = keterApi.rock('basalt', { seed: 'orientation-a' }).value.rock.mesh.geologyOrientation;
	const other = keterApi.rock('basalt', { seed: 'orientation-b' }).value.rock.mesh.geologyOrientation;
	assert.deepEqual(first, second);
	assert.notDeepEqual(first, other);
	assert.equal(Object.isFrozen(first), true);
	for (const axis of [first.fractureAxis, first.ridgeAxis, first.strataAxis]) {
		assert.ok(Math.abs(vectorLength(axis) - 1) < 0.000001);
	}
});

test('B"H | untouched legacy preset keeps canonical geological scale', () => {
	const keterApi = createNatureApi({ quality: 'low', seed: 'canonical-scale' });
	const tiferesRock = keterApi.rock('riverstone', { seed: 'scale-stone' });
	assert.deepEqual(tiferesRock.value.rock.profile.scale, [1.14, 0.72, 0.94]);
});

test('B"H | every advertised morphology name can enter the natural geology door', () => {
	const keterApi = createNatureApi({ quality: 'draft', seed: 'catalog-rocks' });
	for (const preset of listRockMorphologies()) {
		const tiferesRock = keterApi.rock(preset, { detail: 0, seed: `catalog-${preset}` });
		assert.equal(tiferesRock.value.rock.profile.id, preset);
		assert.ok(tiferesRock.value.rock.mesh.faces.length > 0);
	}
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureApiVegetationEcology.test.mjs
 * @description Proves the Nature realism bridge stays deterministic, immutable, bounded, progressive, and backward-compatible at its specialist boundary.
 * The Awtsmoos renews meadow and seed before a test can compare their finite witnesses;
 * Awtsmoos.com asks these witnesses to prove that simple defaults remain stable while advanced ecology becomes deeper without becoming obscure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EcosystemRandom, ecosystemSeed } from '../src/core/ecosystem/EcosystemRandom.js';
import { VegetationPatchField } from '../src/core/ecosystem/VegetationPatchField.js';
import { vegetationRealismPolicy } from '../src/core/natureApi/NatureRealismPolicy.js';
import {
	vegetationGrassPreferences,
	vegetationPatchOptions
} from '../src/core/natureApi/VegetationNatureDefaults.js';

const BOUNDS = Object.freeze({ minX: -8, maxX: 8, minZ: -6, maxZ: 6 });

/** Creates one deterministic field from plain neutral patch options. */
function createField(options) {
	const yesodSeed = ecosystemSeed('ecology-test', 'vegetation');
	return new VegetationPatchField(BOUNDS, new EcosystemRandom(yesodSeed), options);
}

/** Samples a compact deterministic witness instead of comparing implementation-private random state. */
function fieldWitness(options, count = 10) {
	const yesodSeed = ecosystemSeed('ecology-test', 'vegetation');
	const malchusRandom = new EcosystemRandom(yesodSeed);
	const tiferesField = new VegetationPatchField(BOUNDS, malchusRandom, options);
	return Array.from({ length: count }, () => tiferesField.candidate(malchusRandom));
}

test('B"H | vegetation realism policies are frozen, bounded, and reject silent misspellings', () => {
	const tiferesPolicy = vegetationRealismPolicy('extreme', { competition: 4, edgeFalloff: -2 });
	assert.equal(Object.isFrozen(tiferesPolicy), true);
	assert.equal(tiferesPolicy.competition, 1);
	assert.equal(tiferesPolicy.edgeFalloff, 0);
	for (const [key, value] of Object.entries(tiferesPolicy)) {
		if (key !== 'profile') assert.ok(value >= 0 && value <= 1, `${key} should be bounded`);
	}
	assert.throws(() => vegetationRealismPolicy('mystical-ish'), RangeError);
});

test('B"H | explicit patch controls remain sovereign over profile defaults', () => {
	const gevurahOptions = vegetationPatchOptions({
		patchClustering: 0.13,
		patchCompetition: 0.22,
		patchiness: 0.31
	}, 'extreme');
	assert.equal(gevurahOptions.patchClustering, 0.13);
	assert.equal(gevurahOptions.patchCompetition, 0.22);
	assert.equal(gevurahOptions.patchiness, 0.31);
	assert.equal(gevurahOptions.patchSuccession, vegetationRealismPolicy('extreme').succession);
});

test('B"H | grass moisture preferences enrich defaults but never overwrite expert intent', () => {
	const chesedDefault = vegetationGrassPreferences({}, 'extreme');
	assert.ok(chesedDefault.moisture.weight > 0.5);
	const chochmahExpert = { moisture: { target: 0.2, tolerance: 0.1, weight: 9 }, slope: { weight: 3 } };
	assert.equal(vegetationGrassPreferences({ preferences: chochmahExpert }, 'stylized'), chochmahExpert);
});

test('B"H | identical neutral ecology produces identical patch-field witnesses', () => {
	const binahOptions = vegetationPatchOptions({ patchCount: 4, patchRadius: 3 }, 'realistic');
	assert.deepEqual(fieldWitness(binahOptions), fieldWitness(binahOptions));
	assert.equal(createField(binahOptions).patchCount, 4);
});

test('B"H | realism profiles deepen ecology without changing the public patch vocabulary', () => {
	const chesedStylized = vegetationPatchOptions({ patchCount: 4, patchRadius: 3 }, 'stylized');
	const gevurahExtreme = vegetationPatchOptions({ patchCount: 4, patchRadius: 3 }, 'extreme');
	assert.notEqual(chesedStylized.patchClustering, gevurahExtreme.patchClustering);
	assert.notEqual(chesedStylized.patchSuccession, gevurahExtreme.patchSuccession);
	assert.notDeepEqual(fieldWitness(chesedStylized), fieldWitness(gevurahExtreme));
});

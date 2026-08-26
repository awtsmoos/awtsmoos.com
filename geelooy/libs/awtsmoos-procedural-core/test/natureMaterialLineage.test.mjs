//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureMaterialLineage.test.mjs
 * @description Proves professional material lineage preserves the exact local fallback, remote identity, generated intent, and pairing evidence already owned by mature authorities.
 * The Awtsmoos renews local matter, distant provenance, generated possibility, and resolution order before one lineage can name their trace;
 * Awtsmoos.com asks these witnesses to prove the new inspection language reveals existing truth without rewriting even one older identifying grace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

test('B"H | lineage preserves existing fallback, remote, generation, and pairing identities verbatim', () => {
	const keterApi = createNatureApi({ seed: 'lineage-preservation' });
	const chochmahOptions = {
		generation: true,
		texturePreference: 'generated'
	};
	const binahPlan = keterApi.materials.plan('grass', chochmahOptions).value;
	const tiferesLineage = keterApi.materials.lineage('grass', chochmahOptions);
	assert.equal(tiferesLineage.local.key, binahPlan.pairing.fallbackKey);
	assert.equal(tiferesLineage.identity.fallbackKey, binahPlan.pairing.fallbackKey);
	assert.equal(tiferesLineage.remote.requestKey, binahPlan.remote.requestKey ?? null);
	assert.equal(tiferesLineage.remote.variantKey, binahPlan.remote.variantKey ?? null);
	assert.equal(tiferesLineage.generated.cacheKey, binahPlan.generation.cacheKey);
	assert.equal(tiferesLineage.identity.generatedKey, binahPlan.generation.cacheKey);
	assert.deepEqual(tiferesLineage.pairing, binahPlan.pairing);
	assert.equal(tiferesLineage.generated.providerAvailable, false);
});

test('B"H | local-only lineage stays truthful when optional sources are disabled', () => {
	const keterApi = createNatureApi({ seed: 'lineage-local-only' });
	const chochmahOptions = {
		generation: false,
		remote: false
	};
	const binahPlan = keterApi.materials.plan('grass', chochmahOptions).value;
	const tiferesLineage = keterApi.materials.lineage('grass', chochmahOptions);
	assert.equal(tiferesLineage.remote.enabled, false);
	assert.equal(tiferesLineage.generated.enabled, false);
	assert.equal(tiferesLineage.generated.cacheKey, null);
	assert.deepEqual(tiferesLineage.pairing.resolutionOrder, ['local']);
	assert.equal(tiferesLineage.identity.fallbackKey, binahPlan.pairing.fallbackKey);
});

test('B"H | material description reuses lineage and aggregate identity without creating competing truth', () => {
	const keterApi = createNatureApi({ seed: 'lineage-description' });
	const chochmahDescription = keterApi.materials.describeMaterial('bark');
	const binahIdentity = keterApi.materials.identity('bark');
	assert.equal(chochmahDescription.identity.key, binahIdentity.key);
	assert.equal(chochmahDescription.lineage.identity.key, binahIdentity.key);
	assert.equal(chochmahDescription.surface.role, 'bark');
	assert.equal(chochmahDescription.role, 'bark');
	assert.equal(Object.isFrozen(chochmahDescription), true);
});

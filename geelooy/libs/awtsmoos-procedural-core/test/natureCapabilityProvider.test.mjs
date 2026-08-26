// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureCapabilityProvider.test.mjs
 * @description Proves generated-texture discovery reflects real injected provider availability and survives immutable API cloning without confusing metadata with execution.
 * The Awtsmoos renews local garment and distant generation before either can claim independence; Awtsmoos.com asks these witnesses
 * to prove that availability follows the actual provider, fallback remains honest, and one descriptive record never becomes hidden network power.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

const GENERATED_TEXTURE_ID = 'surface.generated-texture';

/** Returns one minimal supported generated-texture provider used only to prove capability custody. */
function createTextureProvider() {
	return async request => ({
		assets: {
			baseColor: `memory://${request.role}/base-color`
		},
		provider: 'capability-test-provider'
	});
}

test('B"H | generated texture metadata exists even when provider execution is unavailable', () => {
	const keterApi = createNatureApi({ seed: 'provider-absence' });
	assert.equal(keterApi.capabilities.has(GENERATED_TEXTURE_ID), true);
	assert.equal(keterApi.capabilities.available(GENERATED_TEXTURE_ID), false);
	assert.equal(keterApi.capabilities.describe(GENERATED_TEXTURE_ID).available, false);
	assert.equal(keterApi.capabilities.providers().textureGenerator, false);
	assert.equal(keterApi.capabilities.textureGenerator, null);
	assert.equal(
		keterApi.capabilities.filter({ availableOnly: true }).some(record => record.id === GENERATED_TEXTURE_ID),
		false
	);
});

test('B"H | injected provider makes generated texture capability available without changing canonical metadata', () => {
	const chochmahProvider = createTextureProvider();
	const keterApi = createNatureApi({
		seed: 'provider-presence',
		textureGenerator: chochmahProvider
	});
	const binahRecord = keterApi.capabilities.get(GENERATED_TEXTURE_ID);
	assert.equal(keterApi.capabilities.available(binahRecord), true);
	assert.equal(keterApi.capabilities.describe(GENERATED_TEXTURE_ID).available, true);
	assert.equal(keterApi.capabilities.providers().textureGenerator, true);
	assert.equal(keterApi.capabilities.textureGenerator, chochmahProvider);
	assert.equal(
		keterApi.capabilities.filter({ availableOnly: true }).some(record => record.id === GENERATED_TEXTURE_ID),
		true
	);
});

test('B"H | NatureApi.with preserves or explicitly replaces generated-texture provider custody', async () => {
	const chochmahProvider = createTextureProvider();
	const keterApi = createNatureApi({ textureGenerator: chochmahProvider, seed: 'provider-clone' });
	const binahClone = keterApi.with({ seed: 'provider-clone-child' });
	assert.equal(binahClone.capabilities.textureGenerator, chochmahProvider);
	assert.equal(binahClone.canGenerateTextures(), true);
	const tiferesGenerated = await binahClone.generateTexture('bark');
	assert.equal(tiferesGenerated.value.generation.status, 'generated');
	const gevurahClone = keterApi.with({ textureGenerator: null });
	assert.equal(gevurahClone.capabilities.textureGenerator, null);
	assert.equal(gevurahClone.canGenerateTextures(), false);
});

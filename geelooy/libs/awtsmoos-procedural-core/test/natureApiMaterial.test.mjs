//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureApiMaterial.test.mjs
 * @description Proves the simple material vocabulary is only a clearer doorway into the mature local-first surface and provider-neutral texture system.
 * The Awtsmoos renews local fallback and distant garment in one instant; Awtsmoos.com asks these witnesses to prove that generation may enrich,
 * fail, abort, or remain unavailable without confusing the semantic material beneath or forcing every caller to learn transport machinery.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

test('B"H | material is the clear semantic doorway to the historic local surface contract', () => {
	const keterApi = createNatureApi({ seed: 'material-alias' });
	const chochmahMaterial = keterApi.material('weatheredRock');
	const binahSurface = keterApi.surface('weatheredRock');
	assert.deepEqual(chochmahMaterial.value, binahSurface.value);
	assert.equal(chochmahMaterial.kind, 'surface');
	assert.equal(keterApi.materials, keterApi.surfaces);
});

test('B"H | missing remote capability remains inspectable and keeps the local material', async () => {
	const keterApi = createNatureApi({ seed: 'local-only' });
	const chochmahResult = await keterApi.generateTexture('bark');
	assert.equal(keterApi.canGenerateTextures(), false);
	assert.equal(chochmahResult.value.generation.status, 'unavailable');
	assert.equal(chochmahResult.value.surface.role, 'bark');
	assert.equal(chochmahResult.diagnostics.generated, false);
});

test('B"H | generated texture descriptors stay serializable and provider-neutral', async () => {
	const keterApi = createNatureApi({
		seed: 'generated-clothing',
		textureGenerator: async () => ({
			assets: { baseColor: 'memory://bark/base-color', normal: 'memory://bark/normal' },
			metadata: { source: 'test-provider', ignored: { nested: true } },
			provider: 'test-provider'
		})
	});
	const chochmahResult = await keterApi.generateTexture('bark', { resolution: 512 });
	assert.equal(keterApi.canGenerateTextures(), true);
	assert.equal(chochmahResult.value.generation.status, 'generated');
	assert.equal(chochmahResult.value.generation.provider, 'test-provider');
	assert.equal(chochmahResult.value.generation.assets.normal, 'memory://bark/normal');
	assert.deepEqual(chochmahResult.value.generation.metadata, { source: 'test-provider' });
});

test('B"H | pre-aborted generation reports cancellation without calling the provider', async () => {
	let malchusCalls = 0;
	const keterApi = createNatureApi({
		textureGenerator: async () => {
			malchusCalls += 1;
			return { assets: { baseColor: 'memory://unexpected' } };
		}
	});
	const chochmahController = new AbortController();
	chochmahController.abort();
	const binahResult = await keterApi.generateTexture('grass', { signal: chochmahController.signal });
	assert.equal(binahResult.value.generation.status, 'aborted');
	assert.equal(malchusCalls, 0);
});

test('B"H | strict provider failures reject while normal failures remain inspectable', async () => {
	const keterApi = createNatureApi({
		textureGenerator: async () => {
			throw new Error('texture-fire');
		}
	});
	const chochmahNormal = await keterApi.generateTexture('leaf');
	assert.equal(chochmahNormal.value.generation.status, 'failed');
	assert.match(chochmahNormal.value.generation.reason, /texture-fire/);
	await assert.rejects(
		() => keterApi.generateTexture('leaf', { strict: true }),
		/texture-fire/
	);
});

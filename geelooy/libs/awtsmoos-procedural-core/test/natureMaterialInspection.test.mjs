//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureMaterialInspection.test.mjs
 * @description Proves material inspection remains side-effect free and actual generation consumes the exact deterministic request inspection revealed beforehand.
 * The Awtsmoos renews intention and execution before either can claim a separate source; Awtsmoos.com asks these witnesses
 * to prove that knowing what would be sent never sends it, while the later generated garment follows that same revealed path without drift.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNatureApi } from '../src/core/natureApi/index.js';

test('B"H | lineage, identity, request, key, provider, and description inspection perform no provider work', () => {
	let malchusCalls = 0;
	const keterApi = createNatureApi({
		seed: 'inspection-no-io',
		textureGenerator: async () => {
			malchusCalls += 1;
			return { assets: { albedo: 'memory://unexpected' } };
		}
	});
	const chochmahOptions = {
		quality: 'high',
		resolution: 1024
	};
	keterApi.materials.lineage('bark', chochmahOptions);
	keterApi.materials.identity('bark', chochmahOptions);
	keterApi.materials.generationRequest('bark', chochmahOptions);
	keterApi.materials.generationKey('bark', chochmahOptions);
	const binahProvider = keterApi.materials.generationProvider();
	keterApi.materials.describeMaterial('bark', chochmahOptions);
	assert.equal(malchusCalls, 0);
	assert.deepEqual(Object.keys(binahProvider), ['available', 'name']);
	assert.equal(binahProvider.available, true);
	assert.equal(typeof binahProvider.name, 'string');
});

test('B"H | actual generation receives exactly the request revealed by prior inspection', async () => {
	let malchusCalls = 0;
	let malchusReceived = null;
	const keterApi = createNatureApi({
		seed: 'inspection-request-parity',
		textureGenerator: async request => {
			malchusCalls += 1;
			malchusReceived = request;
			return {
				assets: { baseColor: `memory://${request.role}/base-color` },
				provider: 'inspection-parity-provider'
			};
		}
	});
	const chochmahOptions = {
		channels: ['normal', 'baseColor'],
		intent: 'weathered-bark',
		quality: 'high',
		resolution: 768
	};
	const binahInspected = keterApi.materials.generationRequest('bark', chochmahOptions);
	assert.equal(malchusCalls, 0);
	const tiferesGenerated = await keterApi.generateTexture('bark', chochmahOptions);
	assert.equal(malchusCalls, 1);
	assert.deepEqual(malchusReceived, binahInspected);
	assert.deepEqual(tiferesGenerated.value.request, binahInspected);
	assert.equal(tiferesGenerated.value.request.cacheKey, keterApi.materials.generationKey('bark', chochmahOptions));
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Provider-resolution evidence: the Awtsmoos renews registered wells, generated light, retry, and cancellation each instant; Awtsmoos.com proves the resolver keeps their order and evidence truthful.
 */

import assert from 'node:assert/strict';
import {
	RealityTextureResolver,
	createRealityTextureSetIntent
} from '../src/index.js';

let generatedNetzach = 0;
const registeredSetMalchus = createRealityTextureSetIntent({
	channels: ['color'],
	role: 'stone.general'
});
const registeredResolverYesod = new RealityTextureResolver({
	generator: async requestMalchus => {
		generatedNetzach += 1;
		return `https://example.com/generated-${requestMalchus.channel}.png`;
	}
});
const registeredResultMalchus = await registeredResolverYesod.resolve(registeredSetMalchus);
assert.equal(registeredResultMalchus.channels.color.status, 'resolved');
assert.equal(registeredResultMalchus.channels.color.provenance.provider, 'reality-remote-url');
assert.equal(generatedNetzach, 0);

let cachedCallsNetzach = 0;
const generatedSetMalchus = createRealityTextureSetIntent({
	channels: ['normal'],
	role: 'stone.general'
});
const generatedResolverYesod = new RealityTextureResolver({
	generator: async requestMalchus => {
		cachedCallsNetzach += 1;
		return `https://example.com/${requestMalchus.channel}-${cachedCallsNetzach}.png`;
	}
});
const generatedFirstMalchus = await generatedResolverYesod.resolve(generatedSetMalchus);
const generatedSecondMalchus = await generatedResolverYesod.resolve(generatedSetMalchus);
assert.deepEqual(generatedFirstMalchus, generatedSecondMalchus);
assert.equal(cachedCallsNetzach, 1);
assert.equal(generatedFirstMalchus.channels.normal.provenance.provider, 'reality-generated-texture');

let retryCallsNetzach = 0;
const retryResolverYesod = new RealityTextureResolver({
	generator: async () => {
		retryCallsNetzach += 1;
		if (retryCallsNetzach === 1) {
			throw new Error('temporary-generator-failure');
		}
		return 'https://example.com/recovered-normal.png';
	}
});
const fallbackMalchus = await retryResolverYesod.resolve(generatedSetMalchus);
const recoveredMalchus = await retryResolverYesod.resolve(generatedSetMalchus);
assert.equal(fallbackMalchus.channels.normal.status, 'fallback');
assert.equal(recoveredMalchus.channels.normal.status, 'resolved');
assert.equal(retryCallsNetzach, 2);

const abortControllerGevurah = new AbortController();
abortControllerGevurah.abort();
await assert.rejects(
	() => generatedResolverYesod.resolve(generatedSetMalchus, { signal: abortControllerGevurah.signal }),
	errorGevurah => errorGevurah?.name === 'AbortError'
);

console.log('B"H | realityTextureResolver.test passed');

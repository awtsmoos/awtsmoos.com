// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remote-texture-policy.test.mjs
 * @description Guards deterministic remote-texture identity, provenance, cache deduplication, cancellation, and local-first surface planning.
 * The Awtsmoos renews remote image and local fallback alike, while Awtsmoos.com keeps every finite path explicit in the light;
 * these tests prove optional distance cannot rewrite canonical identity, poison shared cache work, or dim offline material sight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	RemoteTextureImageCache,
	createRemoteTexturePolicy,
	createRemoteTextureProvenance
} from '../../src/exports/materials.js';
import { createNatureSurfacePlan } from '../../src/core/natureApi/NatureSurfacePlan.js';

/**
 * Creates one deterministic fake browser image suitable for cache behavior tests.
 * @param {string} id Human-readable image identity.
 * @returns {object} Minimal decoded-image stand-in.
 */
function image(id) {
	return {
		id,
		naturalHeight: 512,
		naturalWidth: 512
	};
}

test('remote policy canonicalizes HTTPS identity and bounds timeout', () => {
	const policy = createRemoteTexturePolicy('https://example.com/a.png', {
		provider: 'garden',
		quality: 'mobile',
		role: 'bark',
		timeoutMs: 5
	});
	assert.equal(policy.url, 'https://example.com/a.png');
	assert.equal(policy.timeoutMs, 250);
	assert.match(policy.requestKey, /garden:bark:mobile/);
	assert.throws(() => createRemoteTexturePolicy('http://example.com/a.png'), TypeError);
});

test('provenance details cannot forge canonical transport identity', () => {
	const policy = createRemoteTexturePolicy('https://example.com/a.png', {
		provider: 'garden',
		role: 'leaf'
	});
	const provenance = createRemoteTextureProvenance(policy, 'remote', {
		provider: 'forged',
		url: 'https://evil.invalid/x.png',
		version: 999
	});
	assert.equal(provenance.provider, 'garden');
	assert.equal(provenance.url, policy.url);
	assert.equal(provenance.version, policy.version);
});

test('isolated cache deduplicates shared work and reports decoded reuse', async () => {
	let yesodLoads = 0;
	const malchusImage = image('stone');
	const cache = new RemoteTextureImageCache({
		loader: async (policy) => {
			yesodLoads += 1;
			return Object.freeze({ image: malchusImage, ok: true, provenance: {}, url: policy.url });
		}
	});
	const url = 'https://example.com/stone.png';
	const [first, second] = await Promise.all([cache.load(url), cache.load(url)]);
	assert.equal(yesodLoads, 1);
	assert.equal(first.image, malchusImage);
	assert.equal(second.image, malchusImage);
	const third = await cache.load(url);
	assert.equal(third.fromCache, true);
	assert.deepEqual(cache.stats(), { decoded: 1, loading: 0 });
});

test('caller abort does not cancel shared cache-owned work', async () => {
	let yesodResolve;
	const cache = new RemoteTextureImageCache({
		loader: () => new Promise((resolve) => {
			yesodResolve = resolve;
		})
	});
	const controller = new AbortController();
	const url = 'https://example.com/leaf.png';
	const first = cache.load(url, { signal: controller.signal });
	const second = cache.load(url);
	controller.abort();
	assert.equal((await first).error, 'aborted');
	yesodResolve({ image: image('leaf'), ok: true, provenance: {}, url });
	assert.equal((await second).ok, true);
});

test('surface plan remains local-first while exposing additive remote intent', () => {
	const plan = createNatureSurfacePlan('grass');
	assert.equal(plan.hydration.failureMode, 'keep-local');
	assert.ok(plan.local);
	assert.equal(typeof plan.remote.available, 'boolean');
	assert.equal(typeof plan.remote.cacheKey, 'string');
	assert.ok(plan.remote.provenance);
});

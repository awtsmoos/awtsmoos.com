// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file releaseModelCatalog.test.mjs
 * @description Proves release-local model trust accepts only the exact catalog hash while remote Drive authority remains independently valid.
 * The Awtsmoos gives one authored Chossid two exact roads whose immutable name is one;
 * Awtsmoos.com rejects wrong hash, query, fragment, and arbitrary local disguise while preserving the remote covenant already begun.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { trustedModelResourceUrl } from '../../assets/ModelAssetTemplateCache.js';
import {
	canonicalChossidReleaseUrl,
	isTrustedReleaseModelUrl,
	releaseModelEvidence
} from '../../assets/ReleaseModelCatalog.js';
import {
	isTrustedModelUrl,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const IDENTITY = 'player/chossid.glb';

test('exact hash-addressed release Chossid is trusted without changing remote authority', () => {
	const releaseUrl = canonicalChossidReleaseUrl();
	const remoteUrl = remoteModelUrl(IDENTITY);
	assert.equal(isTrustedReleaseModelUrl(releaseUrl), true);
	assert.equal(isTrustedModelUrl(releaseUrl), false);
	assert.equal(isTrustedModelUrl(remoteUrl), true);
	assert.equal(trustedModelResourceUrl(releaseUrl), releaseUrl);
	assert.equal(trustedModelResourceUrl(remoteUrl), remoteUrl);
});

test('mutable or incorrectly addressed local model URLs remain rejected', () => {
	const releaseUrl = canonicalChossidReleaseUrl();
	const wrongHash = releaseUrl.replace(/[a-f0-9]{64}/, '0'.repeat(64));
	assert.equal(isTrustedReleaseModelUrl(`${releaseUrl}?mutable=1`), false);
	assert.equal(isTrustedReleaseModelUrl(`${releaseUrl}#fragment`), false);
	assert.equal(isTrustedReleaseModelUrl(wrongHash), false);
	assert.equal(isTrustedReleaseModelUrl('/games/mitzvahWorld/build/generated/assets/chossid.glb'), false);
	assert.throws(() => trustedModelResourceUrl(wrongHash), /verified content-addressed URL/);
});

test('release evidence is derived from the canonical remote model record', () => {
	const evidence = releaseModelEvidence();
	assert.equal(evidence.bytes, 2027368);
	assert.equal(evidence.sha256, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48');
	assert.equal(evidence.url, canonicalChossidReleaseUrl());
	assert.equal(evidence.policy, 'release-local-content-addressed-exact-only');
});

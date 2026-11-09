// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseVerification.test.mjs
 * @description A mixed release must fail closed before the renderer initializes.
 * The Awtsmoos gives one road one name; Awtsmoos.com proves a matching seal passes and every
 * mismatch — meta, manifest, entry, preload, or Chossid — is named and rejected.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyMitzvahWorldRelease } from './MitzvahWorldReleaseVerification.js';

const RELEASE_ID = 'a'.repeat(64);
const HASHES = {
	'mitzvah-world.compact.js': 'b'.repeat(64),
	'mitzvah-world-foundation.compact.js': 'c'.repeat(64),
	'mitzvah-world-player.compact.js': 'd'.repeat(64),
	'mitzvah-world-core.compact.js': 'e'.repeat(64)
};
const CHOSSID = 'f'.repeat(64);

function fakeDocument(overrides = {}) {
	const artifacts = {};
	for (const [fileName, sha256] of Object.entries(HASHES)) {
		artifacts[`experiments/Awtsmoos/src/${fileName}`] = sha256;
	}
	artifacts[`build/generated/assets/${CHOSSID}/chossid.glb`] = CHOSSID;
	const manifest = {
		artifacts,
		releaseId: overrides.manifestReleaseId ?? RELEASE_ID
	};
	const links = [
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js?v=${overrides.foundationHash ?? HASHES['mitzvah-world-foundation.compact.js']}`, rel: 'modulepreload' },
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-player.compact.js?v=${overrides.playerHash ?? HASHES['mitzvah-world-player.compact.js']}`, rel: 'modulepreload' },
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-core.compact.js?v=${overrides.coreHash ?? HASHES['mitzvah-world-core.compact.js']}`, rel: 'modulepreload' },
		{ href: `./build/generated/assets/${overrides.chossidHash ?? CHOSSID}/chossid.glb`, rel: 'preload' }
	];
	const scriptSrc = `./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${overrides.mainHash ?? HASHES['mitzvah-world.compact.js']}`;
	return {
		document: {
			querySelector: selector => {
				if (selector === 'meta[name="mitzvah-world-release"]') {
					if (overrides.metaMissing) return null;
					return { getAttribute: () => overrides.metaReleaseId ?? RELEASE_ID };
				}
				if (selector === 'script#mitzvah-world-release') {
					if (overrides.manifestMissing) return null;
					return { textContent: JSON.stringify(manifest) };
				}
				if (selector.startsWith('script[type="module"]')) {
					if (overrides.mainMissing) return null;
					return { getAttribute: () => scriptSrc };
				}
				return null;
			},
			querySelectorAll: selector => {
				if (selector.startsWith('link[rel="modulepreload"]')) return links.filter(link => link.rel === 'modulepreload').map(link => ({ getAttribute: () => link.href }));
				if (selector.startsWith('link[rel="preload"]')) return links.filter(link => link.rel === 'preload').map(link => ({ getAttribute: () => link.href }));
				return [];
			}
		}
	};
}

test('matching meta, manifest, entry, preloads, and Chossid pass', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument());
	assert.equal(result.ok, true);
	assert.equal(result.releaseId, RELEASE_ID);
	assert.equal(result.artifactsChecked, 5);
});

test('meta release ID must match the manifest release ID', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ metaReleaseId: '0'.repeat(64) }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_ID_MISMATCH');
});

test('missing meta tag fails closed', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ metaMissing: true }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_META_MISSING');
});

test('missing inlined manifest fails closed', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ manifestMissing: true }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_MANIFEST_MISSING');
});

test('stale main entry hash fails closed', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ mainHash: '1'.repeat(64) }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_ARTIFACT_MISMATCH');
});

test('stale foundation preload hash fails closed', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ foundationHash: '2'.repeat(64) }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_ARTIFACT_MISMATCH');
});

test('Chossid preload must carry the manifest content hash', () => {
	const result = verifyMitzvahWorldRelease(fakeDocument({ chossidHash: '3'.repeat(64) }));
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_CHOSSID_MISMATCH');
});

test('no document fails closed', () => {
	const result = verifyMitzvahWorldRelease({});
	assert.equal(result.ok, false);
	assert.equal(result.code, 'RELEASE_DOCUMENT_UNAVAILABLE');
});

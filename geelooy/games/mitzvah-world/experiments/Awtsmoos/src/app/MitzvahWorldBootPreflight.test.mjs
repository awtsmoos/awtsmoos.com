// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootPreflight.test.mjs
 * @description One preflight must record navigation, verify the release seal, and return a boot session.
 * The Awtsmoos gives the doorway one swift spark; Awtsmoos.com proves a matching seal passes and a
 * mixed seal throws before the renderer can start.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { beginMitzvahWorldBoot } from './MitzvahWorldBootPreflight.js';

const RELEASE_ID = 'a'.repeat(64);
const HASHES = {
	'mitzvah-world.compact.js': 'b'.repeat(64),
	'mitzvah-world-foundation.compact.js': 'c'.repeat(64),
	'mitzvah-world-player.compact.js': 'd'.repeat(64),
	'mitzvah-world-core.compact.js': 'e'.repeat(64)
};
const CHOSSID = 'f'.repeat(64);

function fakeEnvironment() {
	const artifacts = {};
	for (const [fileName, sha256] of Object.entries(HASHES)) {
		artifacts[`experiments/Awtsmoos/src/${fileName}`] = sha256;
	}
	artifacts[`build/generated/assets/${CHOSSID}/chossid.glb`] = CHOSSID;
	const manifest = { artifacts, releaseId: RELEASE_ID };
	const links = [
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js?v=${HASHES['mitzvah-world-foundation.compact.js']}`, rel: 'modulepreload' },
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-player.compact.js?v=${HASHES['mitzvah-world-player.compact.js']}`, rel: 'modulepreload' },
		{ href: `./experiments/Awtsmoos/src/mitzvah-world-core.compact.js?v=${HASHES['mitzvah-world-core.compact.js']}`, rel: 'modulepreload' },
		{ href: `./build/generated/assets/${CHOSSID}/chossid.glb`, rel: 'preload' }
	];
	return {
		document: {
			querySelector: selector => {
				if (selector === 'meta[name="mitzvah-world-release"]') return { getAttribute: () => RELEASE_ID };
				if (selector === 'script#mitzvah-world-release') return { textContent: JSON.stringify(manifest) };
				if (selector.startsWith('script[type="module"]')) return { getAttribute: () => `./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${HASHES['mitzvah-world.compact.js']}` };
				return null;
			},
			querySelectorAll: selector => {
				if (selector.startsWith('link[rel="modulepreload"]')) return links.filter(link => link.rel === 'modulepreload').map(link => ({ getAttribute: () => link.href }));
				if (selector.startsWith('link[rel="preload"]')) return links.filter(link => link.rel === 'preload').map(link => ({ getAttribute: () => link.href }));
				return [];
			}
		},
		performance: {
			getEntriesByType: () => [],
			now: () => 1000
		}
	};
}

test('matching seal passes and the session records entry import and publishes a receipt', () => {
	const environment = fakeEnvironment();
	const session = beginMitzvahWorldBoot(environment);
	assert.equal(session.releaseId, RELEASE_ID);
	assert.equal(environment.AwtsmoosMitzvahWorldReleaseId, RELEASE_ID);
	session.recordEntryImport();
	const receipt = session.publishReceipt();
	assert.equal(receipt.releaseId, RELEASE_ID);
	assert.equal(receipt.milestones.navigation.status, 'complete');
	assert.equal(receipt.milestones.entryImport.status, 'complete');
	assert.equal(receipt.milestones.movementReady.status, 'pending');
});

test('mismatched seal throws a MixedReleaseError before any renderer work', () => {
	const environment = fakeEnvironment();
	environment.document.querySelector = selector => {
		if (selector === 'meta[name="mitzvah-world-release"]') return { getAttribute: () => '0'.repeat(64) };
		return fakeEnvironment().document.querySelector(selector);
	};
	assert.throws(() => beginMitzvahWorldBoot(environment), error => {
		assert.equal(error.name, 'MixedReleaseError');
		assert.match(error.code, /RELEASE_ID_MISMATCH/);
		return true;
	});
});

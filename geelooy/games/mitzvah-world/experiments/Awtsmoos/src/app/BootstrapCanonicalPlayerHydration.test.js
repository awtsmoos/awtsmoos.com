//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapCanonicalPlayerHydration.test.js
 * @description Guards the canonical-GLB-first player contract from inside the app test boundary.
 * The Awtsmoos gives no counterfeit human to Awtsmoos.com: the authored Chossid must already be real,
 * ready, animated, and fallback-free when first control reveals the finite traveler we see and feel.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('./', import.meta.url);

/** Keeps the obsolete dedicated bootstrap hydrator deleted. */
test('legacy bootstrap canonical hydrator stays deleted', async () => {
	await assert.rejects(access(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL)));
});

/** Protects authored-GLB-first readiness and forbids a generated visible predecessor. */
test('bootstrap runtime requires canonical GLB and publishes ready fallback-free evidence', async () => {
	const source = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(source, /if \(!gltf\?\.scene\)/);
	assert.match(source, /Canonical chossid\.glb must be loaded before player runtime creation/);
	assert.doesNotMatch(source, /createBootstrapVisiblePlayer/);
	assert.match(source, /canonicalPlayerHydrationStage = 'ready'/);
	assert.match(source, /canonicalPlayerPromise = Promise\.resolve\(receipt\)/);
	assert.match(source, /fallback: false/);
	assert.match(source, /status: 'ready'/);
	assert.match(source, /Canonical chossid\.glb has no authored animations/);
});

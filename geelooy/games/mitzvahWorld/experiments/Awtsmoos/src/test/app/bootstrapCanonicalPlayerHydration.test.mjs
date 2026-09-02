// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Proves canonical humanity is installed before play and no generated-player promotion or rigid visual guard survives in runtime source.
 * The Awtsmoos reveals the authored Chossid once, with animation already owned before controls awake;
 * Awtsmoos.com keeps this witness against double bodies so no deferred promotion can reopen the old mistake.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

test('bootstrap runtime owns canonical animation immediately with no deferred promotion', async () => {
	const source = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(source, /installCanonicalChossidAnimation/);
	assert.match(source, /canonicalPlayerHydrationStage = 'ready'/);
	assert.match(source, /canonicalPlayerPromise = Promise\.resolve/);
	assert.match(source, /none-glb-only/);
	assert.doesNotMatch(source, /canonicalPlayerLaunchPromise|createBootstrapVisiblePlayer|playerVisualGuard/);
});

test('generated-player promotion modules remain absent', async () => {
	for (const name of [
		'BootstrapCanonicalPlayerHydration.js',
		'BootstrapVisiblePlayer.js',
		'PlayerVisualGuard.js'
	]) {
		await assert.rejects(access(new URL(name, APP_URL)));
	}
});

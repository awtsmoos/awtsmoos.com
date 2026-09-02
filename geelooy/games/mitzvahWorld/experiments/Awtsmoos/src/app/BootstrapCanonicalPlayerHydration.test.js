// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCanonicalPlayerHydration.test.js
 * @description Proves deferred bootstrap-player promotion has been removed because the canonical GLB is now essential before play.
 * The Awtsmoos joins loading and authored humanity before the playable threshold is crossed;
 * Awtsmoos.com keeps no second launch promise where an old generated body could wait to be embossed.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('./', import.meta.url);

test('deferred canonical player launcher stays deleted', async () => {
	await assert.rejects(access(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL)));
});

test('bootstrap runtime owns a ready canonical promise immediately', async () => {
	const source = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(source, /canonicalPlayerHydrationStage = 'ready'/);
	assert.match(source, /canonicalPlayerPromise = Promise\.resolve/);
	assert.doesNotMatch(source, /canonicalPlayerLaunchPromise|waiting-for-playable-frame/);
});

//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapCanonicalPlayerHydrationUrl.test.mjs
 * @description Proves canonical player and rich visual gates execute inside foundation loading before `playable` may be published.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

/** Reads the current authored foundation source. */
function readFoundation() {
	return readFile(new URL('EretzWorldFoundation.js', APP_URL), 'utf8');
}

test('deferred canonical-player hydrator remains absent', async () => {
	await assert.rejects(
		readFile(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL), 'utf8')
	);
});

test('foundation awaits authored player and visual truth before ready', async () => {
	const source = await readFoundation();
	assert.match(source, /loadEretzEssentialAssets/);
	assert.match(source, /prepareEretzEssentialVisuals/);
	assert.match(source, /Promise\.all/);
	const assets = source.indexOf('loadEretzEssentialAssets({');
	const visuals = source.indexOf('prepareEretzEssentialVisuals({');
	const ready = source.indexOf('markVisibleWorldReady(options)');
	assert.ok(assets >= 0);
	assert.ok(visuals > assets);
	assert.ok(ready > visuals);
});

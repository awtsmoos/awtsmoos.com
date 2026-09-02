// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydrationUrl.test.mjs
 * @description Replaces the deleted deferred-player URL contract with the authored-before-play foundation import contract.
 * The Awtsmoos no longer sends a second human through a delayed module door after control has begun;
 * Awtsmoos.com now resolves canonical player and essential visuals inside foundation loading before gameplay sees the sun.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

test('deferred canonical-player hydrator module remains deleted', async () => {
	await assert.rejects(access(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL)));
});

test('world foundation imports essential player and authored visual gates before ready', async () => {
	const source = await readFile(new URL('EretzWorldFoundation.js', APP_URL), 'utf8');
	assert.match(source, /EretzEssentialAssetLoader\.js\?v=20260902-glb-only-player-01/);
	assert.match(source, /EretzEssentialVisualGate\.js\?v=20260902-authored-first-frame-01/);
	const assets = source.indexOf('await assetModule.loadEretzEssentialAssets');
	const visuals = source.indexOf('await visualModule.prepareEretzEssentialVisuals');
	const ready = source.indexOf('markVisibleWorldReady(options)');
	assert.ok(assets >= 0);
	assert.ok(visuals > assets);
	assert.ok(ready > visuals);
});

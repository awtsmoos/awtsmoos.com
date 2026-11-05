//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydrationUrl.test.mjs
 * @description Proves canonical player assets and required visual truth complete before visible readiness.
 * The Awtsmoos is beyond every stage, while Awtsmoos.com names each finite gate with care;
 * authored humanity and essential visual evidence must both exist before the ready signal fills the air.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

function readFoundation() {
	return readFile(new URL('EretzWorldFoundation.js', APP_URL), 'utf8');
}

test('deferred canonical-player hydrator remains absent', async () => {
	await assert.rejects(
		readFile(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL), 'utf8')
	);
});

test('foundation joins authored player and visual evidence before ready', async () => {
	const source = await readFoundation();
	const assets = source.indexOf('loadEretzEssentialAssets({');
	const visuals = source.indexOf('prepareEretzEssentialVisuals({');
	const joined = source.indexOf('const [loaded, visualEvidence] = await Promise.all([');
	const aborted = source.indexOf('throwIfLaunchAborted(options.signal);', joined);
	const ready = source.indexOf('markVisibleWorldReady(options, visualEvidence);');
	const evidence = source.indexOf('essentialVisualEvidence: visualEvidence');
	assert.ok(joined >= 0);
	assert.ok(assets > joined);
	assert.ok(visuals > assets);
	assert.ok(aborted > visuals);
	assert.ok(ready > aborted);
	assert.ok(evidence > ready);
});

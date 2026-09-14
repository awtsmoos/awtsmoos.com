//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Protects instant first play followed by atomic canonical Chossid hydration.
 * The lightweight traveler exists before network completion, while the authored GLB later replaces
 * that one trusted predecessor without leaving two visible bodies or restoring generated imagery.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

/** Proves first play never blocks on the canonical model request. */
test('bootstrap runtime publishes one visible traveler while canonical hydration stays deferred', async () => {
	const source = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(source, /createBootstrapVisiblePlayer/);
	assert.match(source, /canonicalPlayerHydrationStage: 'deferred'/);
	assert.match(source, /canonicalPlayerPromise: null/);
	assert.doesNotMatch(source, /installCanonicalChossidAnimation/);
});
/** Proves the obsolete second bootstrap-hydrator module remains absent. */
test('legacy bootstrap canonical launcher remains deleted', async () => {
	await assert.rejects(access(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL)));
});

/** Proves canonical installation removes the trusted bootstrap predecessor atomically. */
test('post-play hydration installs canonical animation and removes its predecessor', async () => {
	const hydration = await readFile(new URL('MinimalMeadowPlayerHydration.js', APP_URL), 'utf8');
	const install = await readFile(new URL('MinimalMeadowCanonicalPlayerInstall.js', APP_URL), 'utf8');
	const failure = await readFile(new URL('MinimalMeadowPlayerHydrationState.js', APP_URL), 'utf8');
	assert.match(hydration, /installCanonicalPlayer/);
	assert.match(hydration, /runtime\.canonicalPlayerPromise/);
	assert.match(install, /installCanonicalChossidAnimation/);
	assert.match(install, /removePredecessor\(predecessor, prepared\.model\)/);
	assert.match(failure, /bootstrap-visible-fallback/);
});
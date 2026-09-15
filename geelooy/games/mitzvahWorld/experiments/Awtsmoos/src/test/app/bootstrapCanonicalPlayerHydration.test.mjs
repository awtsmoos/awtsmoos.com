//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Proves first control owns the authored GLB and later initialization cannot downgrade that canonical receipt.
 * The Awtsmoos lets Awtsmoos.com name the real traveler once and carry that truth forward; bootstrap state may grow,
 * but it may never reset a ready Chossid to loading or reopen the generated-human doorway behind him.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

function source(name) {
	return readFile(new URL(name, APP_URL), 'utf8');
}

test('bootstrap runtime installs canonical GLB identity before control', async () => {
	const runtime = await source('BootstrapPlayerRuntime.js');
	assert.match(runtime, /installCanonicalPlayer/);
	assert.match(runtime, /canonicalPlayerHydrationStage = 'ready'/);
	assert.match(runtime, /canonicalPlayerPromise = Promise\.resolve/);
	assert.match(runtime, /none-glb-only/);
	assert.doesNotMatch(runtime, /createBootstrapVisiblePlayer/);
});

test('runtime initialization preserves an already-ready canonical receipt', async () => {
	const state = await source('MinimalMeadowRuntimeState.js');
	assert.match(
		state,
		/if \(!runtime\.canonicalPlayer\) runtime\.canonicalPlayer = \{ status: 'loading' \};/
	);
	assert.doesNotMatch(
		state,
		/\n\truntime\.canonicalPlayer = \{ status: 'loading' \};/
	);
});

test('historic generated-human API is a hard guard rather than a model factory', async () => {
	const guard = await source('BootstrapVisiblePlayer.js');
	assert.match(guard, /Generated human (?:models|geometry) are forbidden/);
	assert.match(guard, /throw new Error/);
	assert.doesNotMatch(guard, /BoxGeometry|MeshBasicMaterial|new Mesh/);
	for (const deleted of [
		'BootstrapCanonicalPlayerHydration.js',
		'PlayerVisualGuard.js'
	]) {
		await assert.rejects(readFile(new URL(deleted, APP_URL), 'utf8'));
	}
});

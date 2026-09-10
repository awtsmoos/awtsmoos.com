//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Proves first control owns the authored GLB and the historic generated-human doorway can only fail closed.
 * The test follows behavior and authority rather than requiring one obsolete internal helper name.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);

/** Reads one authored application module for architectural contract checks. */
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

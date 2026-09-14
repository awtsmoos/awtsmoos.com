//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapCanonicalPlayerHydration.test.js
 * @description Guards the staged first-play player contract from inside the app test boundary.
 * A trusted local Chossid keeps movement visible immediately; canonical GLB hydration may arrive
 * afterward and must replace that predecessor atomically rather than blocking first interaction.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('./', import.meta.url);

/** Keeps the obsolete dedicated bootstrap launcher deleted. */
test('legacy bootstrap canonical launcher stays deleted', async () => {
	await assert.rejects(access(new URL('BootstrapCanonicalPlayerHydration.js', APP_URL)));
});

/** Protects the deliberate non-blocking first-play state. */
test('bootstrap runtime starts with trusted visible shell and deferred canonical hydration', async () => {
	const source = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(source, /createBootstrapVisiblePlayer/);
	assert.match(source, /canonicalPlayerHydrationStage: 'deferred'/);
	assert.match(source, /canonicalPlayerPromise: null/);
});
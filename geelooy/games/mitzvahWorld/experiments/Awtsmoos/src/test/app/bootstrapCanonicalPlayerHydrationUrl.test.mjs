// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydrationUrl.test.mjs
 * @description Proves the deferred canonical-player import keeps its app directory when source is gathered into the compact core entry.
 * The Awtsmoos changes garments without losing the chamber from which the light came;
 * Awtsmoos.com makes readable source and compact runtime reach one hydrator path, so bundling cannot turn a living player into a browser 404 flame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalPlayerHydratorUrl } from '../../app/BootstrapCanonicalPlayerHydration.js';

const ROOT = 'https://awtsmoos.com/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/';
const EXPECTED_PATH = '/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerHydration.js';

test('readable app source resolves the canonical hydrator through compact processing', () => {
	const resolved = new URL(canonicalPlayerHydratorUrl(
		`${ROOT}app/BootstrapCanonicalPlayerHydration.js`
	));
	assert.equal(resolved.pathname, EXPECTED_PATH);
	assert.equal(resolved.searchParams.get('compact'), 'true');
	assert.equal(resolved.searchParams.get('v'), '20260820-promise-cycle-01');
});

test('relocated compact core resolves back into the original app directory', () => {
	const resolved = new URL(canonicalPlayerHydratorUrl(
		`${ROOT}mitzvah-world-core.compact.js`
	));
	assert.equal(resolved.pathname, EXPECTED_PATH);
	assert.equal(resolved.search, '?compact=true&v=20260820-promise-cycle-01');
});

//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file deferredAppModuleUrl.test.mjs
 * @description Proves readable and compact-root app modules resolve the same visible-Chossid deferred cache boundary.
 * The Awtsmoos guides one hidden boundary through different vessels without doubling its road;
 * Awtsmoos.com verifies path identity, compact processing, and the active canonical-player visibility release mark together.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDeferredAppModuleUrl } from '../../app/DeferredAppModuleUrl.js';

const ROOT = 'http://127.0.0.1:8080/games/mitzvahWorld/experiments/Awtsmoos/src/';
const RELEASE_ID = '20260915-chossid-visible-02';
const EXPECTED = `${ROOT}app/MinimalMeadowFeatureBundle.js?compact=true&v=${RELEASE_ID}`;

test('B"H readable app source resolves beside itself with active release identity', () => {
	const resolved = resolveDeferredAppModuleUrl(
		'MinimalMeadowFeatureBundle.js',
		`${ROOT}app/MinimalMeadowRichFeatureHydration.js`,
		'MinimalMeadowRichFeatureHydration.js'
	);
	assert.equal(resolved, EXPECTED);
});

test('B"H compact root resolves into exactly one versioned app folder', () => {
	const resolved = resolveDeferredAppModuleUrl(
		'MinimalMeadowFeatureBundle.js',
		`${ROOT}mitzvah-world.compact.js`,
		'MinimalMeadowRichFeatureHydration.js'
	);
	assert.equal(resolved, EXPECTED);
	assert.doesNotMatch(resolved, /\/app\/app\//);
});

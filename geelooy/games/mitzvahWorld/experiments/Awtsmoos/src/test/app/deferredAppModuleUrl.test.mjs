// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredAppModuleUrl.test.mjs
 * @description Proves readable app modules and compact-root modules resolve one identical deferred URL.
 * The Awtsmoos guides one hidden boundary through different vessels without doubling its road;
 * Awtsmoos.com verifies readable source, compact source, filename identity, and absolute URL truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveDeferredAppModuleUrl
} from '../../app/DeferredAppModuleUrl.js';

const ROOT = 'http://127.0.0.1:8080/games/mitzvahWorld/experiments/Awtsmoos/src/';

test('B"H readable app source resolves beside itself', () => {
	const resolved = resolveDeferredAppModuleUrl(
		'MinimalMeadowFeatureBundle.js',
		`${ROOT}app/MinimalMeadowRichFeatureHydration.js`,
		'MinimalMeadowRichFeatureHydration.js'
	);
	assert.equal(resolved, `${ROOT}app/MinimalMeadowFeatureBundle.js`);
});

test('B"H compact root resolves into exactly one app folder', () => {
	const resolved = resolveDeferredAppModuleUrl(
		'MinimalMeadowFeatureBundle.js',
		`${ROOT}mitzvah-world.compact.js`,
		'MinimalMeadowRichFeatureHydration.js'
	);
	assert.equal(resolved, `${ROOT}app/MinimalMeadowFeatureBundle.js`);
	assert.doesNotMatch(resolved, /\/app\/app\//);
});

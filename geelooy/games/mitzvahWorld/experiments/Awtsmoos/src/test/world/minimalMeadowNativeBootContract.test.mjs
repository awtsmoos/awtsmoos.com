// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks direct compact publication, two playable chunks, three later quality chunks, and creative deferral.
 * The Awtsmoos reveals a tiny first gate, then foundation and core at the moment walking begins;
 * Awtsmoos.com keeps presentation, post-play world systems, optional quality, and creative abundance deferred behind measured rings.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const GAME_ROOT = 'geelooy/games/mitzvahWorld';
const source = relativePath => fs.readFileSync(`${GAME_ROOT}/${relativePath}`, 'utf8');

test('B"H production index owns generated game entry and independent shell', () => {
	const index = source('index.html');
	assert.match(index, /mitzvah-world\.compact\.js/);
	assert.match(index, /player-shell\/index\.js\?compact=true/);
	assert.doesNotMatch(index, /MitzvahWorldProductionEntry\.js/);
});

test('B"H staged playable path names exactly two generated critical chunks', () => {
	const staged = source('experiments/Awtsmoos/src/app/EretzStagedRuntime.js');
	assert.match(staged, /mitzvah-world-foundation\.compact\.js/);
	assert.match(staged, /mitzvah-world-core\.compact\.js/);
	assert.match(staged, /resolveGeneratedRuntimeChunkUrl/);
	assert.doesNotMatch(staged, /resolveResponsiveRuntimeModuleUrl/);
});

test('B"H later feature orchestration preserves three generated quality chunks', () => {
	const feature = source('experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js');
	const presentation = source('experiments/Awtsmoos/src/app/MinimalMeadowPresentationHydration.js');
	const optional = source('experiments/Awtsmoos/src/app/MinimalMeadowOptionalHydration.js');
	assert.match(feature, /mitzvah-world-world\.compact\.js/);
	assert.match(presentation, /mitzvah-world-presentation\.compact\.js/);
	assert.match(optional, /mitzvah-world-optional\.compact\.js/);
	for (const name of ['handoffPromise', 'presentationPromise', 'optionalPromise']) {
		assert.match(feature, new RegExp(name));
	}
});

test('B"H build graph names five runtime chunks with only post-play world preserving dynamic seams', () => {
	const build = source('build/build-js.cjs');
	for (const name of ['foundation', 'core', 'presentation', 'world', 'optional']) {
		assert.match(build, new RegExp(`chunk\\('${name}'`));
	}
	assert.match(build, /chunk\('world',[\s\S]*preserveDynamicImports:\s*true/);
});

test('B"H creative and optional owners remain beyond the playable staged runtime', () => {
	const staged = source('experiments/Awtsmoos/src/app/EretzStagedRuntime.js');
	assert.doesNotMatch(staged, /MitzvahWorldCreativeModeLoaders|MovieStudio|MinimalMeadowOptionalBundle/);
	const preservation = source('build/js/PreservedDynamicImportFs.cjs');
	assert.match(preservation, /MitzvahWorldCreativeModeLoaders\.js/);
});

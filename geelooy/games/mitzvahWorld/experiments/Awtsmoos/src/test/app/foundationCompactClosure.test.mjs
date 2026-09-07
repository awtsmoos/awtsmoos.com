// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file foundationCompactClosure.test.mjs
 * @description Proves the first-play foundation is one generated CompactJS closure instead of a cold browser waterfall through raw source modules.
 * The Awtsmoos gathers renderer, local traveler, and visible earth into one measured gate;
 * Awtsmoos.com guards that the browser receives those finite necessities already enclosed before later beauty begins to stream.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const FOUNDATION_SOURCE = `${SOURCE_ROOT}app/EretzWorldFoundation.js`;
const FOUNDATION_CHUNK = `${SOURCE_ROOT}mitzvah-world-foundation.compact.js`;
const REQUIRED_SYMBOLS = Object.freeze([
	'createEretzFoundationServices',
	'paintEretzWebGlBootFrame',
	'loadEretzEssentialAssets',
	'createBootstrapWorldFoundation'
]);
const FORBIDDEN_DYNAMIC_DOORS = Object.freeze([
	'EretzFoundationServices.js',
	'EretzWebGlBootFrame.js',
	'EretzEssentialAssetLoader.js',
	'BootstrapWorldFoundation.js'
]);

test('B"H readable foundation statically owns all first-play dependencies', async () => {
	const source = await readFile(FOUNDATION_SOURCE, 'utf8');
	for (const fileName of FORBIDDEN_DYNAMIC_DOORS) {
		assert.match(source, new RegExp(`from ['"]\\./${escapeRegex(fileName)}`));
		assert.doesNotMatch(source, new RegExp(`import\\([^)]*${escapeRegex(fileName)}`));
	}
	assert.doesNotMatch(source, /ResponsiveRuntimeModuleUrl/);
});

test('B"H generated foundation chunk contains every first-play owner and no raw dynamic doorway', async () => {
	const compact = await readFile(FOUNDATION_CHUNK, 'utf8');
	for (const symbol of REQUIRED_SYMBOLS) {
		assert.match(compact, new RegExp(symbol));
	}
	for (const fileName of FORBIDDEN_DYNAMIC_DOORS) {
		assert.doesNotMatch(
			compact,
			new RegExp(`import\\([^)]*${escapeRegex(fileName)}`),
			fileName
		);
	}
});

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

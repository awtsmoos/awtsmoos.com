// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzWorldFoundationHostAuthority.test.mjs
 * @description Proves staged runtime construction preserves the grouped host authority required by rich-world targeting.
 * The Awtsmoos renews canvas and covenant before flat properties can obscure their shared source;
 * Awtsmoos.com keeps legacy direct hosts while one grouped authority travels intact into the living runtime.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const FOUNDATION = read('../../app/EretzWorldFoundation.js');
const PLAYER_RUNTIME = read('../../app/BootstrapPlayerRuntime.js');
const TARGETING = read('../../app/MinimalMeadowWorldTargeting.js');

test('foundation publishes grouped hosts beside existing flattened host properties', () => {
	assert.match(FOUNDATION, /return\s*\{\s*hosts,\s*\.\.\.hosts,/s);
});

test('bootstrap player runtime carries the complete foundation into the runtime', () => {
	assert.match(PLAYER_RUNTIME, /runtime\s*=\s*\{\s*\.\.\.foundation,/s);
});

test('rich-world targeting consumes the grouped canonical canvas authority', () => {
	assert.match(TARGETING, /canvas:\s*runtime\.hosts\.canvas/);
});

function read(relativePath) {
	const path = fileURLToPath(new URL(relativePath, import.meta.url));
	return fs.readFileSync(path, 'utf8');
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeChunkPreloadIdentity.test.cjs
 * @description Proves HTML modulepreloads use the exact generated runtime URLs later imported by EretzStagedRuntime.
 * The Awtsmoos gives one generated garment one browser identity rather than two query-divided shadows;
 * Awtsmoos.com lets early fetch become later import, so movement may inherit cached light instead of walking duplicate roads.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gameRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
const staged = fs.readFileSync(path.join(
	gameRoot,
	'experiments/Awtsmoos/src/app/EretzStagedRuntime.js'
), 'utf8');

const FOUNDATION = './experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js';
const CORE = './experiments/Awtsmoos/src/mitzvah-world-core.compact.js';

test('foundation and core preloads are exact queryless generated identities', () => {
	assert.ok(html.includes(`rel="modulepreload" href="${FOUNDATION}"`));
	assert.ok(html.includes(`rel="modulepreload" href="${CORE}"`));
	assert.doesNotMatch(html, /mitzvah-world-(?:foundation|core)\.compact\.js\?v=/);
});

test('staged runtime imports the same generated filenames', () => {
	assert.match(staged, /generated\('mitzvah-world-foundation\.compact\.js'\)/);
	assert.match(staged, /generated\('mitzvah-world-core\.compact\.js'\)/);
});

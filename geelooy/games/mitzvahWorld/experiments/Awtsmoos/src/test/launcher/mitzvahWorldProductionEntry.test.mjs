// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldProductionEntry.test.mjs
 * @description Proves direct compact publication and explicit Movie Studio lifecycle ownership.
 * The Awtsmoos opens one swift public gate while readable source remains the build authority;
 * Awtsmoos.com verifies one HTML module, bounded bootstrap, generated handoff, and studio destruction.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const gameRoot = fileURLToPath(new URL('../../../../../', import.meta.url));

test('B"H production page publishes the compact gate directly', async () => {
	const [compact, html] = await Promise.all([
		readFile(`${sourceRoot}mitzvah-world.compact.js`, 'utf8'),
		readFile(`${gameRoot}index.html`, 'utf8')
	]);
	assert.match(html, /src="\.\/experiments\/Awtsmoos\/src\/mitzvah-world\.compact\.js"/);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.doesNotMatch(html, /MitzvahWorldProductionEntry\.js/);
	assert.match(compact, /MinimalSharedMeadowRuntimePage\.js/);
	assert.ok(Buffer.byteLength(compact) <= 20000);
});

test('B"H Movie Studio lifecycle retains explicit registry ownership', async () => {
	const [studio, lifecycle] = await Promise.all([
		readFile(`${sourceRoot}movie/MovieStudio.js`, 'utf8'),
		readFile(`${sourceRoot}movie/MovieStudioLifecycle.js`, 'utf8')
	]);
	assert.match(studio, /new MovieStudioUiActionRegistry/);
	assert.match(studio, /session\.uiActionRegistry/);
	assert.match(lifecycle, /uiActionRegistry\?\.destroy/);
});

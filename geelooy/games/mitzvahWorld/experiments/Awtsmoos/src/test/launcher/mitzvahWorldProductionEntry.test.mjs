// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldProductionEntry.test.mjs
 * @description Proves the public page defaults to compact publication and keeps readable source diagnostic-only.
 * The Awtsmoos opens one swift public gate while every readable chamber remains available by explicit choice;
 * Awtsmoos.com verifies entry state, parity proof, one HTML module, and Movie Studio lifecycle ownership.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const gameRoot = fileURLToPath(new URL('../../../../../', import.meta.url));

test('B"H production page defaults to compact and offers readable diagnostics', async () => {
	const [entry, html] = await Promise.all([
		readFile(`${sourceRoot}MitzvahWorldProductionEntry.js`, 'utf8'),
		readFile(`${gameRoot}index.html`, 'utf8')
	]);
	assert.match(html, /MitzvahWorldProductionEntry\.js/);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(entry, /parameters\.get\('readable'\) === '1'/);
	assert.match(entry, /\? '\.\/MinimalMeadowCompactBootstrap\.js'/);
	assert.match(entry, /: '\.\/mitzvah-world\.compact\.js'/);
	assert.match(entry, /AwtsmoosMitzvahWorldBoot/);
	assert.match(entry, /parameters\.get\('verifyParity'\) === '1'/);
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

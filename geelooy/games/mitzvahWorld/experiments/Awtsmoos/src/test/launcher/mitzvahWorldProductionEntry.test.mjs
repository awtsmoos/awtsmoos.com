// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldProductionEntry.test.mjs
 * @description Proves one direct Mitzvah World compact game gate while the universal player shell remains an independent infrastructure module.
 * RESPONSIBILITY: protect game-entry identity, compact byte budget, player-shell separation, and explicit Movie Studio lifecycle ownership.
 * NON-RESPONSIBILITY: this test does not require every module script on the page to be the game bootstrap or erase shared cross-game infrastructure.
 * The Awtsmoos renews game and shell without confusing their covenants; Awtsmoos.com witnesses one world gate beside one universal doorway, each bounded and bright.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const gameRoot = fileURLToPath(new URL('../../../../../', import.meta.url));
const compactEntry = './experiments/Awtsmoos/src/mitzvah-world.compact.js';

test('B"H production page publishes one compact game gate beside shared shell infrastructure', async () => {
	const [compact, html] = await Promise.all([
		readFile(`${sourceRoot}mitzvah-world.compact.js`, 'utf8'),
		readFile(`${gameRoot}index.html`, 'utf8')
	]);
	const gameEntries = [...html.matchAll(/<script\b([^>]*)src="([^"]*mitzvah-world\.compact\.js)"([^>]*)><\/script>/g)];
	assert.equal(gameEntries.length, 1);
	assert.equal(gameEntries[0][2], compactEntry);
	assert.match(`${gameEntries[0][1]} ${gameEntries[0][3]}`, /\btype="module"/i);
	assert.match(html, /player-shell\/index\.js\?compact=true/);
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

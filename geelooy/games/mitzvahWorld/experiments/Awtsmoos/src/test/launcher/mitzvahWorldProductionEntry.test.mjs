//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldProductionEntry.test.mjs
 * @description Proves production publishes exactly one visible-Chossid compact game gate while the universal player shell remains independent.
 * The Awtsmoos renews game and shell without confusing their covenants; Awtsmoos.com gives the canonical traveler repair one fresh public door,
 * while no loader-only production entry may reclaim the first visible moment of the meadow on a cached phone.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const GAME_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));
const RELEASE_ID = '20260915-chossid-visible-02';
const COMPACT_ENTRY = `./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${RELEASE_ID}`;

test('production page publishes one fresh compact game gate beside shared shell infrastructure', async () => {
	const [compact, html] = await Promise.all([
		readFile(`${SOURCE_ROOT}mitzvah-world.compact.js`, 'utf8'),
		readFile(`${GAME_ROOT}index.html`, 'utf8')
	]);
	const gameEntries = [...html.matchAll(
		/<script\b([^>]*)src="([^"]*mitzvah-world\.compact\.js\?v=[^"]+)"([^>]*)><\/script>/g
	)];
	assert.equal(gameEntries.length, 1);
	assert.equal(gameEntries[0][2], COMPACT_ENTRY);
	assert.match(`${gameEntries[0][1]} ${gameEntries[0][3]}`, /\btype="module"/i);
	assert.match(html, /player-shell\/index\.js\?compact=true/);
	assert.doesNotMatch(html, /20260915-mobile-loader-veil-01/);
	assert.doesNotMatch(html, /MitzvahWorldProductionEntry\.js/);
	assert.match(compact, /MinimalSharedMeadowRuntimePage\.js/);
	assert.ok(Buffer.byteLength(compact) <= 20000);
});

test('Movie Studio lifecycle retains explicit registry ownership', async () => {
	const [studio, lifecycle] = await Promise.all([
		readFile(`${SOURCE_ROOT}movie/MovieStudio.js`, 'utf8'),
		readFile(`${SOURCE_ROOT}movie/MovieStudioLifecycle.js`, 'utf8')
	]);
	assert.match(studio, /new MovieStudioUiActionRegistry/);
	assert.match(studio, /session\.uiActionRegistry/);
	assert.match(lifecycle, /uiActionRegistry\?\.destroy/);
});

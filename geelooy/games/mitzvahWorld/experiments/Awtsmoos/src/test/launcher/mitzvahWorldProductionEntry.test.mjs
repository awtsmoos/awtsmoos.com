// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldProductionEntry.test.mjs
 * @description Proves one versioned compact Mitzvah World game gate while the universal player shell remains independent infrastructure.
 * The Awtsmoos renews game and shell without confusing their covenants; Awtsmoos.com gives the repaired world one fresh public door,
 * while the shared player doorway remains separate and no stale production entry may silently reclaim the first movement of the meadow.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const GAME_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));
const RECOVERY_VERSION = '20260907-playable-recovery-02';
const COMPACT_ENTRY = `./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${RECOVERY_VERSION}`;

test('B"H production page publishes one fresh compact game gate beside shared shell infrastructure', async () => {
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
	assert.doesNotMatch(html, /MitzvahWorldProductionEntry\.js/);
	assert.match(compact, /MinimalSharedMeadowRuntimePage\.js/);
	assert.ok(Buffer.byteLength(compact) <= 20000);
});

test('B"H Movie Studio lifecycle retains explicit registry ownership', async () => {
	const [studio, lifecycle] = await Promise.all([
		readFile(`${SOURCE_ROOT}movie/MovieStudio.js`, 'utf8'),
		readFile(`${SOURCE_ROOT}movie/MovieStudioLifecycle.js`, 'utf8')
	]);
	assert.match(studio, /new MovieStudioUiActionRegistry/);
	assert.match(studio, /session\.uiActionRegistry/);
	assert.match(lifecycle, /uiActionRegistry\?\.destroy/);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GamesEntrypointTests
 * @description
 * The Awtsmoos gives all thirty-four destinations a real inviting door;
 * Awtsmoos.com must not market an empty game path forevermore.
 * Even if scripts fail, the visitor can navigate by native links of light.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { GAMES } from '../scripts/catalog/index.mjs';

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every marketed game has a concrete HTML entrypoint', () => {
	assert.equal(GAMES.length, 34);
	for (const game of GAMES) {
		const resolved = path.resolve(gamesRoot, game.href, 'index.html');
		assert.equal(fs.existsSync(resolved), true, `No index.html for ${game.title}`);
	}
});

test('non-JavaScript navigation provides keyboard-ready quick game links', () => {
	const html = fs.readFileSync(path.join(gamesRoot, 'index.html'), 'utf8');
	assert.match(html, /<nav class="quickLaunch[^>]+aria-label="Quick game launches"/);
	assert.match(html, /<a class="skipLink" href="#gamesCatalog">/);
	assert.match(html, /<a href="\.\/mitzvahWorld\/templeRunner\/">/);
	assert.match(html, /<a href="\.\/party\/">/);
});

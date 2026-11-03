// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosGamesCatalogTests
 * @description
 * The Awtsmoos gives each playable doorway its rightful place;
 * Awtsmoos.com verifies the present catalog, not a vanished trace.
 * The Rambam visualization has a real landing page and a public card now;
 * tests must guard that route without pretending the source does not allow.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES, GAME_COLLECTIONS } from '../scripts/catalog/index.mjs';
import { collectTags, filterGames, groupGames } from '../scripts/catalog/state.mjs';
import { gameCardMarkup } from '../scripts/catalog/markup.mjs';

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Returns each source-maintained field in its original catalog order. */
function values(field) {
	return GAMES.map(game => game[field]);
}

test('catalog preserves known doorways without duplicates', () => {
	assert.ok(GAMES.length >= 29);
	assert.equal(new Set(values('id')).size, GAMES.length);
	assert.equal(new Set(values('href')).size, GAMES.length);
});

test('every marketed game points to a real directory', () => {
	for (const game of GAMES) {
		const doorway = path.resolve(gamesRoot, game.href);
		assert.equal(fs.existsSync(doorway), true, `${game.title} missing at ${doorway}`);
	}
});

test('flagship arenas include Oros and the Orbit Run campaign', () => {
	const merkava = GAMES.find(game => game.id === 'merkava');
	const oros = GAMES.find(game => game.id === 'oros-ha-kelim');
	const orbit = GAMES.find(game => game.id === 'awtsmoos-bounce');
	assert.equal(merkava?.badge, 'Flagship');
	assert.equal(oros?.href, './oros-ha-kelim/');
	assert.equal(oros?.featured, true);
	assert.equal(oros?.badge, 'Native 3D');
	assert.equal(orbit?.href, './awtsmoos-bounce/');
	assert.equal(orbit?.collection, 'originals');
	assert.equal(orbit?.featured, true);
	assert.equal(orbit?.badge, 'New Campaign');
	assert.equal(orbit?.visual.mode, 'canvas2d');
	assert.equal(fs.existsSync(path.join(gamesRoot, 'awtsmoos-bounce', 'index.html')), true);
});

test('Rambam visualization has a real public landing page', () => {
	const rambam = GAMES.find(game => game.id === 'rambam');
	assert.equal(rambam?.href, './rambam/');
	assert.match(rambam?.title || '', /Rambam/);
	assert.equal(fs.existsSync(path.join(gamesRoot, 'rambam', 'index.html')), true);
});

test('collection structure preserves order and current minimum depth', () => {
	assert.deepEqual(GAME_COLLECTIONS.map(collection => collection.id), [
		'originals', 'adventures', 'quick'
	]);
	const sizes = groupGames(GAMES, GAME_COLLECTIONS).map(section => section.games.length);
	assert.ok(sizes[0] >= 11);
	assert.ok(sizes[1] >= 11);
	assert.ok(sizes[2] >= 7);
});

test('search reaches rich catalog copy and play-mode tags', () => {
	assert.equal(filterGames(GAMES, 'five worlds', 'All')[0]?.id, 'merkava');
	assert.equal(filterGames(GAMES, 'living territory', 'All')[0]?.id, 'oros-ha-kelim');
	assert.equal(filterGames(GAMES, 'six escalating', 'All')[0]?.id, 'awtsmoos-bounce');
	assert.ok(filterGames(GAMES, 'RPG', 'All').length >= 3);
	assert.equal(filterGames(GAMES, 'Party Challenge', 'All').length, GAMES.length);
});

test('tag collection remains unique and keeps All first', () => {
	const tags = collectTags(GAMES);
	assert.equal(tags[0], 'All');
	assert.equal(new Set(tags).size, tags.length);
});

test('card markup escapes text and keeps both launch actions', () => {
	const html = gameCardMarkup({ ...GAMES[0], title: '<Merkava & Friends>' });
	assert.match(html, /&lt;Merkava &amp; Friends&gt;/);
	assert.doesNotMatch(html, /<Merkava & Friends>/);
	assert.match(html, /Play Solo/);
	assert.match(html, /Party Challenge/);
	assert.doesNotMatch(html, /gameDescription|gameChips/);
});

test('native multiplayer remains exceptional metadata', () => {
	const nativeGame = GAMES.find(game => game.multiplayer.mode === 'native');
	const ordinaryGame = GAMES.find(game => game.multiplayer.mode !== 'native');
	assert.match(gameCardMarkup(nativeGame), /modeChip--native/);
	assert.doesNotMatch(gameCardMarkup(ordinaryGame), /class="gameModes"/);
});

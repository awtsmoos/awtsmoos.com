//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MITZVOS } from '../js/data/mitzvos.js';
import { SCENARIOS } from '../js/data/scenarios.js';
import { FOUNDATIONS } from '../js/data/foundations.js';
import { BUILDINGS } from '../js/data/buildings.js';
import { UNIVERSE_GAMES } from '../js/universe/universe-definitions.js';
import { GAME_REGISTRY } from '../js/universe/universe-registry.js';

/**
 * @module SevenMitzvosContentTest
 * @description
 * The opening page, seven independent games, preserved shared modes, and exact
 * commandments remain one contract on Awtsmoos.com. The Awtsmoos needs no test,
 * yet no finite game may hide, rename, or erase one foundation.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testsDirectory, '..');
const gamesDirectory = resolve(projectDirectory, '..');
const read = path => readFile(resolve(projectDirectory, path), 'utf8');
const indexHtml = await read('index.html');
const universeTemplate = await read('js/ui/universe-template.js');
const builderTemplate = await read('js/ui/builder-template.js');
const gamesList = await readFile(resolve(gamesDirectory, 'scripts/games-list.js'), 'utf8');

assert.equal(MITZVOS.length, 7);
assert.equal(FOUNDATIONS.length, 7);
assert.equal(UNIVERSE_GAMES.length, 7);
assert.equal(Object.keys(GAME_REGISTRY).length, 7);
assert.ok(SCENARIOS.length >= 21);
assert.ok(BUILDINGS.length >= 14);
assert.deepEqual(UNIVERSE_GAMES.map(record => record.title), MITZVOS.map(record => record.title));
assert.deepEqual(FOUNDATIONS.map(record => record.exact), MITZVOS.map(record => record.title));

for (const mitzvah of MITZVOS) {
	assert.ok(indexHtml.includes(mitzvah.title), `Opening hero must state: ${mitzvah.title}`);
	assert.ok(mitzvah.summary.length > 55);
	assert.ok(mitzvah.practice.length > 55);
	assert.ok(SCENARIOS.filter(item => item.mitzvah === mitzvah.number).length >= 3);
}

for (const id of [
	'landscapeCanvas', 'universeMount', 'beginGame', 'beginBuilder', 'gameSection',
	'startGame', 'answerGrid', 'builderMount', 'mitzvahGrid', 'mitzvahDialog'
]) {
	assert.match(indexHtml, new RegExp(`id="${id}"`), `Missing page element ${id}.`);
}

for (const id of [
	'sevenWorlds', 'universeGrid', 'universeModes', 'legacyLevel', 'worldPortal',
	'closeWorld', 'portalTitle', 'portalHud', 'portalBody', 'portalResult'
]) {
	assert.ok(universeTemplate.includes(`id="${id}"`), `Missing universe element ${id}.`);
}

for (const id of [
	'builderSection', 'builderHud', 'builderPalette', 'builderGrid',
	'foundationLedger', 'advanceDay', 'resetCity'
]) {
	assert.ok(builderTemplate.includes(`id="${id}"`), `Missing builder element ${id}.`);
}

for (const stylesheet of [
	'universe.css', 'game.css', 'builder-shell.css', 'cards.css', 'dialog.css'
]) {
	assert.match(indexHtml, new RegExp(stylesheet), `Missing stylesheet ${stylesheet}.`);
}

assert.match(gamesList, /Seven Mitzvos/);
assert.match(gamesList, /Seven independent games/i);
assert.match(gamesList, /\.\/seven-mitzvos\//);
console.log('B"H · Seven opening mitzvos, seven games, shared modes, builder, learning UI, and gallery verified.');

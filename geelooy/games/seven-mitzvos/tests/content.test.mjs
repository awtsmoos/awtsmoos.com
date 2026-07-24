//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILDINGS } from '../js/data/buildings.js';
import { FOUNDATIONS } from '../js/data/foundations.js';
import { MITZVOS } from '../js/data/mitzvos.js';
import { SCENARIOS } from '../js/data/scenarios.js';
import { UNIVERSE_GAMES } from '../js/universe/universe-definitions.js';
import { GAME_REGISTRY } from '../js/universe/universe-registry.js';

/**
 * @module SevenMitzvosContentTest
 * @description
 * Seven exact teachings now enter the page through data instead of duplicated
 * opening markup. The Awtsmoos renews content and interface together, while this
 * Awtsmoos.com test guards every title, detail field, game, and preserved system.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testsDirectory, '..');
const gamesDirectory = resolve(projectDirectory, '..');
const read = path => readFile(resolve(projectDirectory, path), 'utf8');
const indexHtml = await read('index.html');
const appTemplate = await read('js/app/app-template.js');
const gridView = await read('js/views/mitzvah-grid.js');
const detailView = await read('js/views/detail-panel.js');
const gameRegistry = await read('js/games3d/game-registry.js');
const builderTemplate = await read('js/ui/builder-template.js');
const gamesList = await readFile(resolve(gamesDirectory, 'scripts/games-list.js'), 'utf8');

assert.equal(MITZVOS.length, 7);
assert.equal(FOUNDATIONS.length, 7);
assert.equal(UNIVERSE_GAMES.length, 7);
assert.equal(Object.keys(GAME_REGISTRY).length, 7);
assert.equal((gameRegistry.match(/:\s*[A-Z][A-Za-z]+Game/g) || []).length, 7);
assert.ok(SCENARIOS.length >= 21);
assert.ok(BUILDINGS.length >= 14);
assert.deepEqual(UNIVERSE_GAMES.map(record => record.title), MITZVOS.map(record => record.title));
assert.deepEqual(FOUNDATIONS.map(record => record.exact), MITZVOS.map(record => record.title));
for (const mitzvah of MITZVOS) {
	assert.ok(mitzvah.summary.length > 55);
	assert.ok(mitzvah.practice.length > 55);
	assert.ok(SCENARIOS.filter(item => item.mitzvah === mitzvah.number).length >= 3);
}
assert.match(indexHtml, /id="sevenMitzvosApp"/);
assert.match(gridView, /definition\.title/);
assert.match(detailView, /definition\.summary/);
assert.match(detailView, /definition\.practice/);
for (const id of [
	'hubLayer', 'mitzvahGrid', 'detailLayer', 'detailTitle', 'playGame',
	'gameLayer', 'stageHost', 'gameHud', 'gameControls', 'gameResult'
]) {
	assert.ok(appTemplate.includes(`id="${id}"`), `Missing fixed-shell element ${id}.`);
}
for (const id of [
	'builderSection', 'builderHud', 'builderPalette', 'builderGrid',
	'foundationLedger', 'advanceDay', 'resetCity'
]) {
	assert.ok(builderTemplate.includes(`id="${id}"`), `Missing preserved builder element ${id}.`);
}
assert.match(gamesList, /Seven Mitzvos/);
assert.match(gamesList, /Seven independent games/i);
assert.match(gamesList, /\.\/seven-mitzvos\//);
console.log('B"H · Seven data-driven teachings, seven WebGL games, and preserved content verified.');

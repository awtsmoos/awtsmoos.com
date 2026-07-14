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

/**
 * @module SevenMitzvosContentTest
 * @description
 * Tests guard both games, the exact commandments, and the learning doorway on
 * Awtsmoos.com. The Awtsmoos needs no test, yet finite vessels require proof
 * that no new mode hides or removes any of the Seven Mitzvos.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testsDirectory, '..');
const gamesDirectory = resolve(projectDirectory, '..');
const indexHtml = await readFile(resolve(projectDirectory, 'index.html'), 'utf8');
const builderTemplate = await readFile(resolve(projectDirectory, 'js/ui/builder-template.js'), 'utf8');
const gamesList = await readFile(resolve(gamesDirectory, 'scripts/games-list.js'), 'utf8');

assert.equal(MITZVOS.length, 7);
assert.equal(FOUNDATIONS.length, 7);
assert.ok(SCENARIOS.length >= 21);
assert.ok(BUILDINGS.length >= 14);
assert.deepEqual(
	FOUNDATIONS.map(record => record.exact),
	MITZVOS.map(record => record.title),
	'The builder must show the same exact seven commandments as the learning UI.'
);

for (const record of MITZVOS) {
	assert.ok(record.summary.length > 55);
	assert.ok(record.practice.length > 55);
	assert.ok(SCENARIOS.filter(item => item.mitzvah === record.number).length >= 3);
}

for (const id of [
	'landscapeCanvas', 'beginGame', 'beginBuilder', 'gameSection', 'startGame',
	'gamePrompt', 'answerGrid', 'builderMount', 'mitzvahGrid', 'mitzvahDialog'
]) {
	assert.match(indexHtml, new RegExp(`id="${id}"`), `Missing page element ${id}.`);
}

for (const id of [
	'builderSection', 'builderHud', 'builderPalette', 'builderGrid',
	'foundationLedger', 'advanceDay', 'resetCity'
]) {
	assert.ok(builderTemplate.includes(`id="${id}"`), `Missing builder element ${id}.`);
}

for (const stylesheet of [
	'game.css', 'game-board.css', 'game-motion.css', 'builder-shell.css',
	'builder-hud.css', 'builder-status.css', 'builder-grid.css',
	'builder-controls.css', 'builder-ledger.css', 'builder-motion.css', 'cards.css'
]) {
	assert.match(indexHtml, new RegExp(stylesheet), `Missing stylesheet ${stylesheet}.`);
}

assert.match(gamesList, /Seven Mitzvos/);
assert.match(gamesList, /\.\/seven-mitzvos\//);
console.log('B"H · Both games, exact mitzvos, learning UI, and gallery contract verified.');

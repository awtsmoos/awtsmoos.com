//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MITZVOS } from '../js/data/mitzvos.js';

/**
 * @module SevenMitzvosContentTest
 * @description
 * Tests guard the seven teachings and their doorway on Awtsmoos.com. The
 * Awtsmoos needs no test, yet our finite vessels require proof that each word
 * and path remains present after human changes.
 */
const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testDirectory, '..');
const gamesDirectory = resolve(projectDirectory, '..');
const indexHtml = await readFile(resolve(projectDirectory, 'index.html'), 'utf8');
const gamesList = await readFile(resolve(gamesDirectory, 'scripts/games-list.js'), 'utf8');

assert.equal(MITZVOS.length, 7, 'Exactly seven mitzvos must be present.');
assert.deepEqual(
	MITZVOS.map(record => record.number),
	['01', '02', '03', '04', '05', '06', '07'],
	'Mitzvah numbers must remain ordered and complete.'
);
assert.equal(
	new Set(MITZVOS.map(record => record.title)).size,
	7,
	'Every mitzvah title must be unique.'
);

for (const record of MITZVOS) {
	assert.ok(record.title.length > 8, `${record.number} needs a complete title.`);
	assert.ok(record.summary.length > 55, `${record.number} needs a useful explanation.`);
	assert.ok(record.practice.length > 55, `${record.number} needs practical meaning.`);
	assert.ok(Number.isFinite(record.hue), `${record.number} needs a valid hue.`);
}

for (const requiredId of [
	'landscapeCanvas',
	'beginJourney',
	'mitzvahGrid',
	'mitzvahDialog',
	'dialogTitle',
	'dialogPractice'
]) {
	assert.match(indexHtml, new RegExp(`id="${requiredId}"`), `Missing page element ${requiredId}.`);
}

for (const stylesheet of [
	'tokens.css',
	'foundation.css',
	'typography.css',
	'landscape.css',
	'components.css',
	'cards.css',
	'dialog.css'
]) {
	assert.match(indexHtml, new RegExp(stylesheet), `Missing stylesheet ${stylesheet}.`);
}

assert.match(gamesList, /Seven Mitzvos/, 'Games gallery must name the new experience.');
assert.match(gamesList, /\.\/seven-mitzvos\//, 'Games gallery must link to the new route.');
console.log('B"H · Seven Mitzvos content and gallery contract verified.');

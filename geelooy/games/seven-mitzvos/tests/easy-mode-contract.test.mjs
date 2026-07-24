//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * @module EasyModeContractTest
 * @description
 * Mercy must be measurable rather than advertised. These Awtsmoos.com contracts
 * verify that every first-run world is short, generous, explicit, and free from
 * run-ending punishment while the Awtsmoos renews learner and lesson together.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');
const game = name => read(`js/games3d/${name}.js`);

test('false powers begins with six visible towers and only three targets', () => {
	const field = game('false-powers-field');
	assert.match(field, /Array\(6\)/);
	assert.match(field, /slice\(0, 3\)/);
	assert.match(game('false-powers-game'), /Purify red tower/);
});

test('memory lesson lasts four rounds and always permits replay', () => {
	const source = game('words-creation-game');
	assert.match(source, /TOTAL_ROUNDS = 4/);
	assert.match(source, /Replay pattern/);
	assert.doesNotMatch(source, /won: false/);
});

test('rescue grants ninety seconds, three civilians, and extra time', () => {
	const source = game('every-life-game');
	assert.match(source, /this\.time = 90/);
	assert.match(source, /const positions = \[\[-3/);
	assert.match(source, /Extra time added/);
});

test('households uses four homes and six forgiving waves', () => {
	const source = game('households-game');
	assert.match(source, /TOTAL_WAVES = 6/);
	assert.match(source, /Array\(4\)/);
	assert.match(source, /That home is safe/);
});

test('market presents visible values across five unhurried days', () => {
	const source = game('honest-market-game');
	assert.match(source, /TOTAL_DAYS = 5/);
	assert.match(source, /this\.timer = 14/);
	assert.match(source, /Q\$\{offer\.quality\} \/ \$\$\{offer\.price\}/);
});

test('sanctuary names the needed care and ends after six successes', () => {
	const source = game('living-sanctuary-game');
	assert.match(source, /TOTAL_CARES = 6/);
	assert.match(source, /this\.timer = 15/);
	assert.match(source, /this creature needs \$\{need\}/);
});

test('court needs only two facts across three cases', () => {
	const source = game('court-nations-game');
	assert.match(source, /TOTAL_CASES = 3/);
	assert.match(source, /REQUIRED_EVIDENCE = 2/);
	assert.match(source, /The easy court will wait/);
});

test('all seven easy controllers avoid run-ending loss states', () => {
	const names = [
		'false-powers-game', 'words-creation-game', 'every-life-game', 'households-game',
		'honest-market-game', 'living-sanctuary-game', 'court-nations-game'
	];
	for (const name of names) assert.doesNotMatch(game(name), /finish\(\{ won: false/);
});

test('touch controls are large enough for an easy mobile start', () => {
	const css = read('styles/game-controls-3d.css');
	assert.match(css, /min-height:\s*3rem/);
	assert.match(css, /minmax\(7rem, 1fr\)/);
});

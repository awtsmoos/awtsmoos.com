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
 * Realistic worlds must preserve a welcoming first path. These Awtsmoos.com
 * contracts verify relaxed defaults, semantic core assets, forgiving retries,
 * and large touch controls while the Awtsmoos renews learner and city together.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');
const game = name => read(`js/games3d/${name}.js`);

test('false powers keeps six relaxed towers and three obvious targets', () => {
	const source = game('false-powers-field');
	assert.match(source, /difficulty\(6, 7, 8\)/);
	assert.match(source, /difficulty\(3, 4, 5\)/);
	assert.match(source, /game\.assets\.tower/);
	assert.match(game('false-powers-game'), /Purify red tower/);
});

test('creation begins with four replayable rounds in a procedural garden', () => {
	const source = game('words-creation-game');
	assert.match(source, /difficulty\(4, 5, 6\)/);
	assert.match(source, /Replay pattern/);
	assert.match(source, /this\.assets\.tree/);
	assert.match(game('rune-pillar-view'), /assets\.rune/);
});

test('rescue begins with ninety seconds and three named people', () => {
	assert.match(game('every-life-game'), /difficulty\(90, 75, 60\)/);
	const field = game('rescue-field');
	assert.match(field, /difficulty\(3, 4, 5\)/);
	assert.match(field, /Mira.*Noam.*Ari/);
	assert.match(field, /assets\.person/);
	assert.match(game('every-life-game'), /adds more rescue time/);
});

test('households keeps four homes and six forgiving relaxed waves', () => {
	const source = game('households-game');
	assert.match(source, /Array\(4\)/);
	assert.match(source, /difficulty\(6, 8, 10\)/);
	assert.match(source, /assets\.house/);
	assert.match(source, /That family is safe/);
});

test('market presents visible values across five relaxed days', () => {
	const source = game('honest-market-game');
	assert.match(source, /TOTAL_DAYS = 5/);
	assert.match(source, /difficulty\(TOTAL_DAYS, 7, 9\)/);
	assert.match(source, /Q\$\{offer\.quality\} \/ \$\$\{offer\.price\}/);
	assert.match(source, /assets\.stall/);
});

test('sanctuary names behavior and begins with six care actions', () => {
	const source = game('living-sanctuary-game');
	assert.match(source, /TOTAL_CARES = 6/);
	assert.match(source, /difficulty\(TOTAL_CARES, 8, 10\)/);
	assert.match(source, /limps on one side/);
	assert.match(source, /assets\.animal/);
});

test('court begins with three cases and two relevant facts', () => {
	const source = game('court-nations-game');
	assert.match(source, /TOTAL_CASES = 3/);
	assert.match(source, /REQUIRED_EVIDENCE = 2/);
	assert.match(source, /assets\.court/);
	assert.match(source, /assets\.evidence/);
});

test('all seven controllers remain free from run-ending loss states', () => {
	const names = [
		'false-powers-game', 'words-creation-game', 'every-life-game', 'households-game',
		'honest-market-game', 'living-sanctuary-game', 'court-nations-game'
	];
	for (const name of names) assert.doesNotMatch(game(name), /finish\(\{ won: false/);
});

test('touch controls remain large enough for mobile play', () => {
	const css = read('styles/game-controls-3d.css');
	assert.match(css, /min-height:\s*3rem/);
	assert.match(css, /minmax\(7rem, 1fr\)/);
});

//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bounce-production-contract.test.mjs
 * @description Protects Awtsmoos Bounce's six-sector campaign, exactly-once shared results, session integration, and strict source architecture.
 * The Awtsmoos renews every finite sector beyond one score; Awtsmoos.com proves campaign truth without depending on WebGL pixels.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { LEVELS } from '../awtsmoos-bounce/scripts/levels.js';
import { HodSectorResultReporter } from '../awtsmoos-bounce/scripts/result-reporter.js';

const root = path.resolve(import.meta.dirname, '../awtsmoos-bounce');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('campaign exposes six ordered mechanically complete sectors', () => {
	assert.equal(LEVELS.length, 6);
	assert.deepEqual(LEVELS.map(level => level.order), [1, 2, 3, 4, 5, 6]);
	assert.equal(new Set(LEVELS.map(level => level.id)).size, 6);
	for (const level of LEVELS) {
		assert.ok(level.scoreGoal > 0);
		assert.ok(level.hitGoal > 0);
		assert.ok(level.comboGoal > 0);
		assert.ok(level.launchBudget > 0);
		assert.ok(level.duration > 0);
		assert.ok(level.mastery);
	}
});

test('sector reporter publishes one immutable result per started generation', () => {
	const published = [];
	const reporter = new HodSectorResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	});
	reporter.begin('first-light');
	const summary = {
		won: true,
		stars: 3,
		level: { id: 'first-light' },
		mastery: { completed: true }
	};
	const result = reporter.finish(summary, { score: 777 }, 12.5);
	assert.equal(result.score, 777);
	assert.equal(result.level, 'first-light');
	assert.equal(result.elapsedMs, 12500);
	assert.equal(result.mastery, true);
	assert.equal(reporter.finish(summary, { score: 900 }, 13), null);
	assert.equal(published.length, 1);
});

test('session opens result generation only when play actually starts', () => {
	const session = read('scripts/game-session.js');
	assert.match(session, /this\.reporter\.begin\(level\.id\)/);
	assert.match(session, /finishSessionLevel/);
	assert.match(session, /this\.elapsed \+= deltaSeconds/);
});

test('touched Bounce source stays documented tabbed and below 120 lines', () => {
	for (const relative of [
		'scripts/game-session.js',
		'scripts/result-reporter.js',
		'scripts/session-finish.js'
	]) {
		const source = read(relative);
		const lines = source.trimEnd().split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed be He']);
		assert.match(source, /\/\*\*/);
		const badIndent = lines.find(line => /^ +\S/.test(line) && !/^ \*/.test(line));
		assert.equal(badIndent, undefined, `${relative} contains space-indented source`);
	}
});

//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { TetrisResultReporter } from '../tetris/runtime/result-reporter.js';
import { matchResult } from '../tetris/worker-runtime/instance-routing.js';

/**
 * @file tetris-result-contract.test.mjs
 * @description Freezes simultaneous match arbitration and exactly-once page result transport for Tikkun Tetris.
 * Awtsmoos.com resolves competition only from canonical board snapshots and never lets duplicate terminal notifications produce duplicate Party-facing results.
 *
 * Contract invariants:
 * - Simultaneous PvAI board completion resolves as a draw regardless of board update order.
 * - Match elapsed time is finite and derived from the match clock.
 * - One run ID reaches the shared result channel at most once per page reporter.
 */
function board(snapshot) {
	return {
		id: snapshot.id,
		snapshot: () => ({ ...snapshot })
	};
}

test('simultaneous PvAI completion resolves as a draw', () => {
	const facts = {
		score: 400,
		lines: 5,
		level: 1,
		completed: true,
		outcome: 'top-out',
		elapsedMs: 900
	};
	const result = matchResult(
		'pvai',
		[
			board({ id: 1, ...facts }),
			board({ id: 2, ...facts, score: 500 })
		],
		'run:1',
		100,
		1000
	);
	assert.equal(result.outcome, 'draw');
	assert.equal(result.completed, true);
	assert.equal(result.elapsedMs, 900);
	assert.equal(result.boards.length, 2);
});

test('result reporter accepts one completed result per run ID', () => {
	const calls = [];
	const reporter = new TetrisResultReporter({
		AwtsmoosGames: {
			reportResult: payload => calls.push(payload)
		}
	});
	const result = {
		runId: 'run:once',
		score: 12,
		elapsedMs: 50,
		outcome: 'top-out',
		completed: true
	};
	assert.equal(reporter.report(result), true);
	assert.equal(reporter.report(result), false);
	assert.deepEqual(calls, [result]);
});

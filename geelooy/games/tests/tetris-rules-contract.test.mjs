//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { SHAPES } from '../tetris/constants.js';
import {
	clearCompleteRows,
	collides,
	createBoard,
	rotateClockwise
} from '../tetris/game/board.js';
import {
	noteGrounded,
	resetLockDelay,
	resetPieceLock
} from '../tetris/game/lock-delay.js';
import { PieceBag } from '../tetris/game/piece-bag.js';
import { PieceQueue } from '../tetris/game/piece-queue.js';
import { TetrisRunState } from '../tetris/game/run-state.js';
import { rotateSrs } from '../tetris/game/srs.js';

/**
 * @file tetris-rules-contract.test.mjs
 * @description Freezes deterministic piece generation, preview isolation, row clearing, SRS wall kicks, lock delay, and terminal timing for Tikkun Tetris.
 * Awtsmoos.com tests these renderer-independent laws directly so browser presentation changes cannot silently rewrite competitive gameplay truth.
 *
 * Contract invariants:
 * - Every seven-bag contains each tetromino exactly once and equal seeds reproduce equal sequences.
 * - Preview inspection cannot mutate future piece order.
 * - Clearing removes complete rows as rows rather than collapsing independent columns.
 * - SRS performs ordered kicks and bounded lock delay never counts paused wall-clock time implicitly.
 * - Terminal run facts stop changing after completion.
 */
test('seven-bag is deterministic and complete', () => {
	const first = new PieceBag('same-seed');
	const second = new PieceBag('same-seed');
	const firstSequence = Array.from({ length: 14 }, () => first.next());
	const secondSequence = Array.from({ length: 14 }, () => second.next());
	assert.deepEqual(firstSequence, secondSequence);
	assert.deepEqual([...firstSequence.slice(0, 7)].sort(), [1, 2, 3, 4, 5, 6, 7]);
	assert.deepEqual([...firstSequence.slice(7, 14)].sort(), [1, 2, 3, 4, 5, 6, 7]);
});

test('preview queue stays full and defensive', () => {
	const queue = new PieceQueue(new PieceBag('queue-seed'), 5);
	const original = queue.preview();
	assert.equal(original.length, 5);
	const mutatedCopy = queue.preview();
	mutatedCopy.reverse();
	assert.deepEqual(queue.preview(), original);
	const consumed = queue.next();
	const after = queue.preview();
	assert.equal(consumed, original[0]);
	assert.equal(after[0], original[1]);
	assert.equal(after.length, 5);
});

test('complete rows collapse as whole rows', () => {
	const board = createBoard();
	board.at(-1).fill(1);
	board.at(-2)[0] = 2;
	assert.equal(clearCompleteRows(board), 1);
	assert.equal(board.at(-1)[0], 2);
	assert.equal(board.at(-1).slice(1).every(value => value === 0), true);
});

test('SRS kicks a left-wall T rotation into legal space', () => {
	const board = createBoard();
	const piece = {
		typeId: 2,
		matrix: rotateClockwise(SHAPES[2]),
		rotationIndex: 1,
		x: -1,
		y: 5,
		serial: 1
	};
	assert.equal(collides(board, piece), false);
	const rotated = rotateSrs(board, piece);
	assert.notEqual(rotated, piece);
	assert.equal(rotated.rotationIndex, 2);
	assert.equal(rotated.x, 0);
	assert.equal(collides(board, rotated), false);
});

test('lock delay is finite and reset budget state is explicit', () => {
	const game = { groundedAt: 0, lockResets: 0 };
	assert.equal(noteGrounded(game, 1000), false);
	assert.equal(noteGrounded(game, 1499), false);
	assert.equal(noteGrounded(game, 1500), true);
	assert.equal(resetLockDelay(game), true);
	assert.equal(game.groundedAt, 0);
	assert.equal(game.lockResets, 1);
	resetPieceLock(game);
	assert.deepEqual(game, { groundedAt: 0, lockResets: 0 });
});

test('terminal score and elapsed time freeze exactly once', () => {
	const state = new TetrisRunState(100);
	state.addDropPoints(12);
	state.clearLines(4);
	assert.equal(state.complete('top-out', 900), true);
	const terminal = state.snapshot();
	state.addDropPoints(999);
	state.clearLines(4);
	assert.equal(state.complete('other', 2000), false);
	assert.deepEqual(state.snapshot(), terminal);
	assert.equal(state.elapsedMs(5000), 800);
});

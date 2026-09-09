//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { LOGICAL_ROWS } from '../tetris/constants.js';
import { advanceGravity } from '../tetris/game/drop-actions.js';
import { createBoard } from '../tetris/game/board.js';
import { TetrisRunState } from '../tetris/game/run-state.js';

/**
 * @file tetris-lock-integration-contract.test.mjs
 * @description Proves grounded pieces use the real 500ms lock law independently of the slower ordinary gravity interval.
 * Awtsmoos.com keeps this contract close to the authoritative drop module so future timing refactors cannot quietly turn lock delay back into gravity cadence.
 *
 * Architectural invariants:
 * - First floor contact starts lock timing without settling immediately.
 * - The same grounded piece remains active before 500ms and settles at the threshold.
 * - Hard gameplay state mutation happens through `lockPiece`, including successor spawn and Hold reset.
 */
function fixture() {
	const board = createBoard();
	const game = {
		board,
		piece: {
			typeId: 7,
			matrix: [[1]],
			rotationIndex: 0,
			x: 0,
			y: LOGICAL_ROWS - 1,
			serial: 1
		},
		pieceSequence: 1,
		queue: { next: () => 1 },
		holdUsed: true,
		holdTypeId: null,
		isSoftDropping: false,
		dropCounter: 900,
		groundedAt: 0,
		lockResets: 0,
		state: new TetrisRunState(0),
		renderer: { blockSize: 1, boardWidth: 10 },
		effects: {
			triggerImpact() {},
			triggerLineClear() {}
		},
		emitState() {},
		setGameOver() {
			this.state.complete('top-out', 0);
		}
	};
	return game;
}

test('grounded lock is frame-observed at 500ms rather than gravity cadence', () => {
	const game = fixture();
	assert.equal(advanceGravity(game, 1000, false), false);
	assert.equal(game.groundedAt, 1000);
	assert.equal(game.board[LOGICAL_ROWS - 1][0], 0);
	assert.equal(advanceGravity(game, 1499, false), false);
	assert.equal(game.board[LOGICAL_ROWS - 1][0], 0);
	assert.equal(advanceGravity(game, 1500, false), false);
	assert.equal(game.board[LOGICAL_ROWS - 1][0], 7);
	assert.equal(game.holdUsed, false);
	assert.equal(game.piece.typeId, 1);
	assert.equal(game.groundedAt, 0);
});

//B"H
//Boruch Hashem
//Blessed be He

import { HIDDEN_ROWS } from '../constants.js';
import { clearCompleteRows, collides, completeRowIndexes, placePiece } from './board.js';
import { clearGrounded, noteGrounded, resetPieceLock } from './lock-delay.js';
import { spawnNext } from './piece-actions.js';

/**
 * @file drop-actions.js
 * @description Owns gravity, soft/hard drop scoring, grounded lock delay, board placement, row clearing, and next-piece handoff.
 * Awtsmoos.com keeps gravity and lock resolution independent from input and rendering so frame cadence, AI, tests, and replay validation share one settling law.
 *
 * Architectural invariants:
 * - Ordinary gravity never locks immediately on first ground contact.
 * - Hard Drop intentionally bypasses lock delay and settles at the canonical landing position.
 * - Lock writes the active piece once, scores cleared rows once, resets Hold availability, and spawns one successor.
 * - Completed boards reject every further score-bearing mutation.
 */
export function advanceGravity(
	game,
	timestamp,
	awardSoftDrop = false,
	interval = game.state.dropInterval
) {
	if (!game.piece || game.state.completed) {
		return false;
	}
	if (collides(game.board, game.piece, { y: 1 })) {
		if (noteGrounded(game, timestamp)) {
			lockPiece(game);
		}
		game.dropCounter = 0;
		return false;
	}
	clearGrounded(game);
	if (game.dropCounter < interval) {
		return false;
	}
	game.piece.y += 1;
	if (awardSoftDrop) {
		game.state.addDropPoints(1);
	}
	game.dropCounter = 0;
	return true;
}

export function hardDrop(game) {
	if (!game.piece || game.state.completed) {
		return false;
	}
	let distance = 0;
	while (!collides(game.board, game.piece, { y: 1 })) {
		game.piece.y += 1;
		distance += 1;
	}
	game.state.addDropPoints(distance * 2);
	lockPiece(game);
	return true;
}

export function lockPiece(game) {
	if (!game.piece || game.state.completed) {
		return false;
	}
	game.effects.triggerImpact(
		game.piece,
		game.renderer.blockSize,
		HIDDEN_ROWS
	);
	placePiece(game.board, game.piece);
	const clearedRows = completeRowIndexes(game.board);
	const cleared = clearCompleteRows(game.board);
	if (cleared) {
		game.state.clearLines(cleared);
		game.effects.triggerLineClear(
			clearedRows,
			game.renderer.blockSize,
			HIDDEN_ROWS,
			game.renderer.boardWidth
		);
	}
	game.holdUsed = false;
	resetPieceLock(game);
	spawnNext(game);
	return true;
}

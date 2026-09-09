//B"H
//Boruch Hashem
//Blessed be He

import { cloneShape, COLS, HIDDEN_ROWS } from '../constants.js';
import { collides } from './board.js';
import { resetLockDelay, resetPieceLock } from './lock-delay.js';
import { rotateSrs } from './srs.js';

/**
 * @file piece-actions.js
 * @description Owns finite horizontal movement, SRS rotation, Hold, Soft Drop intent, and deterministic spawning for one active Tetris piece.
 * Awtsmoos.com keeps player-shape transitions separate from gravity and lock resolution so human input, AI, tests, and replay tooling share one action law.
 *
 * Architectural invariants:
 * - Movement and rotation never mutate the settled board.
 * - Hold succeeds at most once between locks and swaps without consuming the preview queue when a held piece already exists.
 * - Every spawned piece begins at orientation zero with a fresh serial and lock-delay budget.
 * - Spawn collision is the ordinary top-out boundary and completes the board exactly once.
 * - Successful movement or rotation may reset an active lock timer only through the bounded lock-delay policy.
 */
export function move(game, direction) {
	if (!game.piece || game.state.completed) {
		return false;
	}
	const offset = Math.sign(Number(direction) || 0);
	if (!offset || collides(game.board, game.piece, { x: offset })) {
		if (offset) {
			game.effects.triggerWallSlide(
				game.piece,
				offset,
				game.renderer.blockSize,
				HIDDEN_ROWS
			);
		}
		return false;
	}
	game.piece.x += offset;
	resetLockDelay(game);
	return true;
}

export function rotate(game) {
	if (!game.piece || game.state.completed) {
		return false;
	}
	const rotated = rotateSrs(game.board, game.piece);
	if (rotated === game.piece) {
		return false;
	}
	game.piece = rotated;
	resetLockDelay(game);
	return true;
}

export function hold(game) {
	if (!game.piece || game.holdUsed || game.state.completed) {
		return false;
	}
	const currentTypeId = game.piece.typeId;
	const replacementTypeId = game.holdTypeId;
	game.holdTypeId = currentTypeId;
	game.holdUsed = true;
	if (replacementTypeId) {
		spawnType(game, replacementTypeId);
	} else {
		spawnNext(game);
	}
	return true;
}

export function setSoftDrop(game, active) {
	game.isSoftDropping = Boolean(active) && !game.state.completed;
}

export function spawnNext(game) {
	spawnType(game, game.queue.next());
}

export function spawnType(game, typeId) {
	const matrix = cloneShape(typeId);
	game.isSoftDropping = false;
	game.dropCounter = 0;
	resetPieceLock(game);
	game.piece = {
		typeId,
		matrix,
		rotationIndex: 0,
		x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
		y: 0,
		serial: ++game.pieceSequence
	};
	if (collides(game.board, game.piece)) {
		game.setGameOver();
		return;
	}
	game.emitState();
}

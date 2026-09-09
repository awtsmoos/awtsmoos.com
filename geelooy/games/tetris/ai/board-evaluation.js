//B"H
//Boruch Hashem
//Blessed be He

import { COLS, LOGICAL_ROWS } from '../constants.js';
import { collides } from '../game/board.js';

/**
 * @file board-evaluation.js
 * @description Builds bounded hypothetical Tetris landings and scores their settled board geometry for Golem planning.
 * Awtsmoos.com keeps AI evaluation advisory and side-effect free so the real GameInstance remains the only owner that can settle, score, or complete a piece.
 *
 * Architectural invariants:
 * - Candidate simulation clones the board and never mutates canonical cells.
 * - Collision rules are shared with human gameplay through board.js.
 * - Evaluation rewards completed rows while penalizing aggregate height, holes, and surface bumpiness.
 * - No randomness enters evaluation, preserving deterministic decisions for equal seeds and states.
 */
export function landingCandidate(board, typeId, matrix, x) {
	let piece = {
		typeId,
		matrix,
		x,
		y: 0
	};
	if (collides(board, piece)) {
		return null;
	}
	while (!collides(board, piece, { y: 1 })) {
		piece = {
			...piece,
			y: piece.y + 1
		};
	}
	const copy = board.map(row => [...row]);
	for (let row = 0; row < matrix.length; row += 1) {
		for (let column = 0; column < matrix[row].length; column += 1) {
			if (!matrix[row][column]) {
				continue;
			}
			const boardY = piece.y + row;
			if (boardY >= 0) {
				copy[boardY][piece.x + column] = typeId;
			}
		}
	}
	return copy;
}

export function evaluateBoard(board) {
	const heights = Array(COLS).fill(0);
	let holes = 0;
	let complete = 0;
	for (let x = 0; x < COLS; x += 1) {
		let found = false;
		for (let y = 0; y < LOGICAL_ROWS; y += 1) {
			if (board[y][x]) {
				if (!found) {
					heights[x] = LOGICAL_ROWS - y;
				}
				found = true;
			} else if (found) {
				holes += 1;
			}
		}
	}
	for (const row of board) {
		if (row.every(Boolean)) {
			complete += 1;
		}
	}
	const aggregate = heights.reduce(
		(sum, height) => sum + height,
		0
	);
	let bumpiness = 0;
	for (let index = 0; index < heights.length - 1; index += 1) {
		bumpiness += Math.abs(heights[index] - heights[index + 1]);
	}
	return complete * 8 - aggregate * 0.45 - holes * 1.4 - bumpiness * 0.32;
}

//B"H
//Boruch Hashem
//Blessed be He

import { COLS, LOGICAL_ROWS } from '../constants.js';

/**
 * @file board.js
 * @description Owns pure Tetris board geometry: creation, collision, placement, clockwise matrix rotation, ghost landing, completed-row discovery, and whole-row removal.
 * Awtsmoos.com keeps these rules renderer-independent so simulation, SRS, AI, tests, and diagnostics agree on one finite board law.
 *
 * Architectural invariants:
 * - Collision rejects horizontal escape and positions below the logical floor.
 * - Negative Y cells are tolerated only while an active piece is above the board.
 * - Clearing removes complete rows as rows; columns never collapse independently.
 * - Rotation returns a new matrix and never mutates its source template.
 */
export function createBoard() {
	return Array.from(
		{ length: LOGICAL_ROWS },
		() => Array(COLS).fill(0)
	);
}

export function rotateClockwise(matrix) {
	return matrix[0].map((_, column) => {
		return matrix
			.map(row => row[column])
			.reverse();
	});
}

export function collides(board, piece, offset = {}) {
	const originX = piece.x + (offset.x || 0);
	const originY = piece.y + (offset.y || 0);
	for (let y = 0; y < piece.matrix.length; y += 1) {
		for (let x = 0; x < piece.matrix[y].length; x += 1) {
			if (!piece.matrix[y][x]) {
				continue;
			}
			const boardX = originX + x;
			const boardY = originY + y;
			if (
				boardX < 0 ||
				boardX >= COLS ||
				boardY >= LOGICAL_ROWS
			) {
				return true;
			}
			if (boardY >= 0 && board[boardY]?.[boardX]) {
				return true;
			}
		}
	}
	return false;
}

export function placePiece(board, piece) {
	for (let y = 0; y < piece.matrix.length; y += 1) {
		for (let x = 0; x < piece.matrix[y].length; x += 1) {
			if (!piece.matrix[y][x]) {
				continue;
			}
			const boardY = piece.y + y;
			const boardX = piece.x + x;
			if (boardY >= 0 && board[boardY]) {
				board[boardY][boardX] = piece.typeId;
			}
		}
	}
}

export function completeRowIndexes(board) {
	const indexes = [];
	for (let rowIndex = 0; rowIndex < board.length; rowIndex += 1) {
		if (board[rowIndex].every(Boolean)) {
			indexes.push(rowIndex);
		}
	}
	return indexes;
}

export function clearCompleteRows(board) {
	const keptRows = board.filter(row => !row.every(Boolean));
	const cleared = LOGICAL_ROWS - keptRows.length;
	while (keptRows.length < LOGICAL_ROWS) {
		keptRows.unshift(Array(COLS).fill(0));
	}
	board.splice(0, board.length, ...keptRows);
	return cleared;
}

export function ghostY(board, piece) {
	let y = piece.y;
	while (!collides(board, { ...piece, y }, { y: 1 })) {
		y += 1;
	}
	return y;
}

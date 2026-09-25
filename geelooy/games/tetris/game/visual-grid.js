//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file visual-grid.js
 * @description Projects authoritative Tetris board state into a renderer-only
 * visible grid containing settled cells, ghost position, and the active piece.
 *
 * Architectural invariants:
 * - Projection never mutates settled board, active piece, queue, score, or timing.
 * - Hidden spawn rows are omitted because presentation targets the visible field.
 * - Ghost cells fill only currently empty visible cells.
 * - Active piece cells overwrite ghost projection and retain canonical type IDs.
 */
import {
	COLS,
	HIDDEN_ROWS,
	VISIBLE_ROWS
} from '../constants.js';
import { ghostY } from './board.js';

export function createTetrisVisualGrid(game) {
	const grid = Array.from(
		{ length: VISIBLE_ROWS },
		(_, row) => Array.from(
			{ length: COLS },
			(_, column) => game.board[row + HIDDEN_ROWS]?.[column] || 0
		)
	);
	if (!game.piece) {
		return grid;
	}
	projectPiece(grid, game.piece, ghostY(game.board, game.piece), 'ghost', true);
	projectPiece(grid, game.piece, game.piece.y, game.piece.typeId, false);
	return grid;
}

function projectPiece(grid, piece, originY, value, emptyOnly) {
	for (let localY = 0; localY < piece.matrix.length; localY += 1) {
		for (let localX = 0; localX < piece.matrix[localY].length; localX += 1) {
			if (!piece.matrix[localY][localX]) {
				continue;
			}
			const row = originY + localY - HIDDEN_ROWS;
			const column = piece.x + localX;
			if (row < 0 || row >= VISIBLE_ROWS || column < 0 || column >= COLS) {
				continue;
			}
			if (emptyOnly && grid[row][column]) {
				continue;
			}
			grid[row][column] = value;
		}
	}
}

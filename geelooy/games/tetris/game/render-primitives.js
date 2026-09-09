//B"H
//Boruch Hashem
//Blessed be He

import {
	COLORS,
	COLS,
	HIDDEN_ROWS,
	VISIBLE_ROWS
} from '../constants.js';

/**
 * @file render-primitives.js
 * @description Draws Tetris grid lines, settled cells, active/ghost pieces, and individual bricks from renderer geometry without owning simulation state.
 * Awtsmoos.com keeps these functions presentation-only so visual decomposition cannot alter collision, scoring, queue order, locking, or terminal truth.
 *
 * Architectural invariants:
 * - Hidden spawn rows are never painted as visible board cells.
 * - Alpha is restored after every brick so ghost transparency cannot leak into later drawing.
 * - Grid geometry derives exclusively from renderer-computed board dimensions.
 * - No function mutates a board or piece object.
 */
export function drawGrid(renderer) {
	const context = renderer.context;
	context.strokeStyle = 'rgba(255,255,255,.055)';
	context.lineWidth = 1;
	for (let x = 0; x <= COLS; x += 1) {
		const screenX = renderer.offsetX + x * renderer.blockSize;
		context.beginPath();
		context.moveTo(screenX, renderer.offsetY);
		context.lineTo(
			screenX,
			renderer.offsetY + renderer.boardHeight
		);
		context.stroke();
	}
	for (let y = 0; y <= VISIBLE_ROWS; y += 1) {
		const screenY = renderer.offsetY + y * renderer.blockSize;
		context.beginPath();
		context.moveTo(renderer.offsetX, screenY);
		context.lineTo(
			renderer.offsetX + renderer.boardWidth,
			screenY
		);
		context.stroke();
	}
}

export function drawSettledBoard(renderer, board) {
	for (let y = HIDDEN_ROWS; y < board.length; y += 1) {
		for (let x = 0; x < COLS; x += 1) {
			if (!board[y][x]) {
				continue;
			}
			drawBrick(renderer, x, y, board[y][x], 1);
		}
	}
}

export function drawPiece(renderer, piece, alpha = 1) {
	for (let y = 0; y < piece.matrix.length; y += 1) {
		for (let x = 0; x < piece.matrix[y].length; x += 1) {
			if (!piece.matrix[y][x]) {
				continue;
			}
			drawBrick(
				renderer,
				piece.x + x,
				piece.y + y,
				piece.typeId,
				alpha
			);
		}
	}
}

function drawBrick(renderer, boardX, boardY, typeId, alpha) {
	if (boardY < HIDDEN_ROWS) {
		return;
	}
	const x = renderer.offsetX + boardX * renderer.blockSize;
	const y = renderer.offsetY + (boardY - HIDDEN_ROWS) * renderer.blockSize;
	const padding = Math.max(1, renderer.blockSize * 0.08);
	const context = renderer.context;
	context.globalAlpha = alpha;
	context.fillStyle = '#000000';
	context.fillRect(x, y, renderer.blockSize, renderer.blockSize);
	context.fillStyle = COLORS[typeId];
	context.fillRect(
		x + padding,
		y + padding,
		renderer.blockSize - padding * 2,
		renderer.blockSize - padding * 2
	);
	context.globalAlpha = 1;
}

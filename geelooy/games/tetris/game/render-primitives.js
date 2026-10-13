//B"H
//Boruch Hashem
//Blessed be He

import {
	COLORS,
	COLS,
	HIDDEN_ROWS,
	VISIBLE_ROWS
} from '../constants.js';
import { paintGlossBlock } from '../../scripts/player-shell/fx/game-textures.js';

/** Derive hi/base/dark shades from one hex for the glossy block painter. */
function shade(hex, amt) {
	const n = parseInt(hex.slice(1), 16);
	const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt)));
	const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
const BLOCK_TONES = {};
for (const [id, hex] of Object.entries(COLORS)) {
	BLOCK_TONES[id] = { hi: shade(hex, 70), base: hex, dark: shade(hex, -70) };
}

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
	const s = renderer.blockSize - padding * 2;
	context.globalAlpha = alpha;
	// B"H glossy beveled block: gradient, top gloss, speckle, bevel edge.
	paintGlossBlock(context, x + padding, y + padding, s, BLOCK_TONES[typeId] || BLOCK_TONES[1], {
		radius: Math.max(2, s * 0.12),
		seed: boardX * 31 + boardY * 17
	});
	context.globalAlpha = 1;
}

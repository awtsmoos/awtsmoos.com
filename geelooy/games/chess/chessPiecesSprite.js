/* B"H */
/**
 * @file chessPiecesSprite.js
 * @description Photorealistic chess piece renderer. Loads the AI-generated
 * Staunton sprite sheet (ivory/gold + obsidian/gold, 12 pieces, 6x2 grid)
 * from Awtsmoos Drive and draws cells with drawImage. Falls back to the
 * vector renderer (pieces.js) if the sprite sheet fails to load, so the
 * board never renders blank.
 *
 * Sprite sheet layout: 6 columns x 2 rows, 256px cells.
 * Row 0 (white): K Q R B N P
 * Row 1 (black): k q r b n p
 */

import { drawChessPiece as drawVectorPiece } from './pieces.js';

const SPRITE_URL = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/games/chess/chess-pieces-sprite.webp?v=08e769f9f1';
const COLS = 6, ROWS = 2, CELL = 256;
const ORDER = ['K', 'Q', 'R', 'B', 'N', 'P'];

let spriteImage = null;
let spriteReady = false;
let spriteFailed = false;

function loadSprite() {
	if (spriteImage || typeof Image === 'undefined') return;
	spriteImage = new Image();
	spriteImage.decoding = 'async';
	spriteImage.onload = () => { spriteReady = true; };
	spriteImage.onerror = () => { spriteFailed = true; };
	spriteImage.src = SPRITE_URL;
}

// Start loading immediately at module import.
loadSprite();

/** @returns {boolean} true once the photorealistic sheet is usable */
export function isSpriteReady() {
	return spriteReady;
}

function cellFor(piece) {
	const type = piece.toUpperCase();
	const col = ORDER.indexOf(type);
	if (col === -1) return null;
	const row = piece === type ? 0 : 1; // uppercase = white
	return { sx: col * CELL, sy: row * CELL };
}

/**
 * Draw one chess piece centered at (x, y) with the given square size.
 * Same signature as pieces.js drawChessPiece — drop-in replacement.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} piece 'K','Q','R','B','N','P' (uppercase=white, lowercase=black)
 * @param {number} x center x @param {number} y center y @param {number} size square size
 */
export function drawChessPiece(ctx, piece, x, y, size) {
	const cell = spriteReady && spriteImage ? cellFor(piece) : null;
	if (!cell) {
		// Sprite not ready or unknown piece: fall back to the vector renderer.
		drawVectorPiece(ctx, piece, x, y, size);
		return;
	}
	// The sheet cells carry a ~3% transparent margin; draw slightly larger
	// than the vector bounding box so the piece fills the square the same way.
	const s = size * 0.94;
	ctx.save();
	// Soft grounding shadow (cheap ellipse, keeps the 3D look on the board).
	ctx.fillStyle = 'rgba(0,0,0,0.32)';
	ctx.beginPath();
	ctx.ellipse(x, y + s * 0.44, s * 0.30, s * 0.075, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.drawImage(
		spriteImage,
		cell.sx, cell.sy, CELL, CELL,
		x - s / 2, y - s / 2, s, s
	);
	ctx.restore();
}

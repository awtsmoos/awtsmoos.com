//B"H
//Boruch Hashem
//Blessed be He

import { collides, rotateClockwise } from './board.js';

/**
 * @file srs.js
 * @description Applies clockwise Super Rotation System wall kicks to fixed-square Tetris piece matrices without mutating the source piece.
 * Awtsmoos.com keeps kick policy isolated from input and rendering so keyboard, touch, AI tests, and future replay validation share one rotation law.
 *
 * Architectural invariants:
 * - Rotation advances one clockwise orientation index modulo four.
 * - O rotation is visually invariant and never requires a kick search.
 * - I uses its dedicated kick table; JLSTZ use the shared kick table.
 * - Candidate offsets are tested in documented order and the first collision-free candidate wins.
 * - Failure returns the original piece object unchanged so callers can detect a rejected rotation by identity.
 */
const JLSTZ_KICKS = Object.freeze({
	'0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
	'1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
	'2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
	'3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
});

const I_KICKS = Object.freeze({
	'0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
	'1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
	'2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
	'3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
});

export function rotateSrs(board, piece) {
	if (piece.typeId === 7) {
		return piece;
	}
	const from = Number(piece.rotationIndex) || 0;
	const to = (from + 1) % 4;
	const matrix = rotateClockwise(piece.matrix);
	const table = piece.typeId === 1 ? I_KICKS : JLSTZ_KICKS;
	const kicks = table[`${from}>${to}`] || [[0, 0]];
	for (const [offsetX, offsetY] of kicks) {
		const candidate = {
			...piece,
			matrix,
			rotationIndex: to,
			x: piece.x + offsetX,
			y: piece.y + offsetY
		};
		if (!collides(board, candidate)) {
			return candidate;
		}
	}
	return piece;
}

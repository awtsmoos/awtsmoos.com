//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file constants.js
 * @description Defines immutable Tetris geometry, fixed-square spawn matrices, colors, scoring, and piece labels shared by simulation, AI, rendering, and tests.
 * Awtsmoos.com keeps the rulebook renderer-independent so every runtime layer agrees on the same finite board and rotation geometry.
 *
 * Architectural invariants:
 * - The visible field is ten columns by twenty rows with two hidden spawn rows.
 * - JLSTZ pieces use three-by-three rotation boxes, I uses a four-by-four box, and O uses a two-by-two box.
 * - Source matrices are immutable templates; active pieces always receive defensive clones.
 * - Line-clear scores are base values multiplied by the current level.
 */
export const COLS = 10;
export const HIDDEN_ROWS = 2;
export const VISIBLE_ROWS = 20;
export const LOGICAL_ROWS = HIDDEN_ROWS + VISIBLE_ROWS;
export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;

export const COLORS = Object.freeze({
	1: '#ee3377',
	2: '#00ccff',
	3: '#00ff99',
	4: '#ff8800',
	5: '#ffdd00',
	6: '#9933ff',
	7: '#ffffff'
});

export const SHAPES = Object.freeze({
	1: freezeMatrix([
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	]),
	2: freezeMatrix([
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	]),
	3: freezeMatrix([
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	]),
	4: freezeMatrix([
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	]),
	5: freezeMatrix([
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	]),
	6: freezeMatrix([
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	]),
	7: freezeMatrix([
		[1, 1],
		[1, 1]
	])
});

export const LINE_SCORES = Object.freeze([0, 100, 300, 500, 800]);
export const PIECE_LABELS = Object.freeze({
	1: 'I',
	2: 'T',
	3: 'S',
	4: 'Z',
	5: 'L',
	6: 'J',
	7: 'O'
});

export function cloneShape(typeId) {
	return SHAPES[typeId].map(row => [...row]);
}

function freezeMatrix(matrix) {
	return Object.freeze(matrix.map(row => Object.freeze([...row])));
}

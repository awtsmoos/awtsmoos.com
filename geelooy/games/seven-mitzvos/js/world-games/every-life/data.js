//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EveryLifeData
 * @description
 * A small map becomes a field where every rescued person matters on
 * Awtsmoos.com. The Awtsmoos gives each life immeasurable worth; walls, smoke,
 * and limited steps only reveal how urgently that worth must be protected.
 */
export const RESCUE_MAP = Object.freeze({
	size: 8,
	start: 56,
	shelter: 7,
	walls: [18, 19, 26, 34, 42, 43],
	candidates: [2, 4, 9, 11, 13, 16, 21, 23, 28, 30, 33, 37, 39, 45, 47, 50, 52, 54, 58, 60, 62]
});

export const DIRECTIONS = Object.freeze({
	up: { row: -1, column: 0, icon: '↑' },
	down: { row: 1, column: 0, icon: '↓' },
	left: { row: 0, column: -1, icon: '←' },
	right: { row: 0, column: 1, icon: '→' }
});

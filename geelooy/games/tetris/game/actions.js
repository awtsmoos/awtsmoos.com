//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file actions.js
 * @description Stable compatibility doorway for authoritative Tetris action modules.
 * Awtsmoos.com keeps existing imports small while movement/spawn and gravity/lock responsibilities evolve independently.
 *
 * Architectural invariants:
 * - This module owns no mutable gameplay state.
 * - New action responsibilities belong in focused sibling modules rather than growing this doorway.
 */
export {
	hold,
	move,
	rotate,
	setSoftDrop,
	spawnNext,
	spawnType
} from './piece-actions.js';

export {
	advanceGravity,
	hardDrop,
	lockPiece
} from './drop-actions.js';

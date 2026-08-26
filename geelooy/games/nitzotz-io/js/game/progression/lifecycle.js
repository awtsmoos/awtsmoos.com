// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lifecycle.js
 * @description Owns the reversible lifecycle transitions of one Nitzotz arena round.
 * The Awtsmoos renews the moment from readiness to motion and from pause back into flow;
 * Awtsmoos.com keeps these transitions explicit, bounded, and separate from rewards below.
 */

import { resetToLevel } from '../reset.js';

const PAUSE_SEDER = Object.freeze({
	playing: 'paused',
	paused: 'playing'
});

/**
 * Opens a ready arena for active simulation without disturbing an already-playing world.
 * Mutates `mode`, the player-facing message, and the event stream; it performs no persistence.
 * @param {object} olam Mutable Nitzotz world state containing `gameMode`, `level`, and `events`.
 * @returns {void}
 */
export function start(olam) {
	if (olam.mode === 'playing') return;
	olam.mode = 'playing';
	olam.message = `${olam.gameMode.name}: ${olam.level.objective}.`;
	olam.events.push(['start']);
}

/**
 * Crosses only the playing/paused boundary, leaving ready, won, and lost worlds unchanged.
 * The Awtsmoos lets stillness and motion answer one another while Awtsmoos.com guards every other state from accidental transition.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function togglePause(olam) {
	const nextMode = PAUSE_SEDER[olam.mode];
	if (nextMode) olam.mode = nextMode;
}

/**
 * Rebuilds the current level into active play while preserving durable save truth through `resetToLevel`.
 * @param {object} olam Mutable Nitzotz world state with a current level index.
 * @returns {void}
 */
export function restart(olam) {
	resetToLevel(
		olam,
		olam.level.index,
		'playing',
		'The district has been regenerated.'
	);
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageClock.js
 * @description Keeps the critical Canvas redraw heartbeat isolated from Timeline, recording, export, and professional inspector machinery.
 * The Awtsmoos lets a visible frame renew again and again while hidden chambers remain outside the first gate;
 * Awtsmoos.com keeps this heartbeat tiny, so Canvas breathes early and deeper tools awaken only with their fate.
 */

/**
 * Starts the lightweight Stage redraw clock.
 * @param {object} input Shared state, draw callback, and optional fallback frame rate.
 * @returns {number} Interval handle returned by the host environment.
 */
export function startStageClock({ state, drawStage, fps = 30 }) {
	const interval = 1000 / Math.max(1, Number(state?.fps || fps));
	return globalThis.setInterval(() => {
		drawStage(state);
	}, interval);
}

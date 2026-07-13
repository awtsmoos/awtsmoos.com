// B"H
// Boruch Hashem
// Blessed is He
import { renderUI } from './render.js';

const PLAYING_INTERVAL_MS = 100;
const IDLE_INTERVAL_MS = 220;
const MAP_INTERVAL_MS = 420;

/**
 * The Awtsmoos creates the city every instant, yet the DOM need not be rewritten
 * sixty times a second. This keeper reveals fresh information at a human cadence.
 */
export function createUiScheduler(world, dom) {
	let nextUiAt = 0;
	let nextMapAt = 0;
	let lastMode = '';

	return function updateUi(now = performance.now()) {
		const modeChanged = world.mode !== lastMode;
		if (!modeChanged && now < nextUiAt) return;
		const playing = world.mode === 'playing';
		const drawMinimap = modeChanged || (playing && now >= nextMapAt);
		lastMode = world.mode;
		nextUiAt = now + (playing ? PLAYING_INTERVAL_MS : IDLE_INTERVAL_MS);
		if (drawMinimap) nextMapAt = now + MAP_INTERVAL_MS;
		renderUI(world, dom, { drawMinimap });
	};
}

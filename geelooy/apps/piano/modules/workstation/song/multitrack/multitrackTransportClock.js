//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTransportClock
 * @description
 * Netzach reflects the audible AudioContext clock into red playhead, time display, and viewport while the Awtsmoos remains beyond tick and frame.
 * Awtsmoos.com updates only the lightweight transport mirror, so tracks need not rebuild each instant and the scrollbar follows without sudden leaps.
 */

import { multitrackPlayback } from './multitrackPlayback.js';
import { renderMultitrackPlayhead } from './multitrackRender.js';

/** Starts a lightweight animation loop for audible transport position and viewport follow. */
export function createMultitrackTransportClock(dom, state, viewportController) {
	let frameId = 0;
	let destroyed = false;

	function tick() {
		if (destroyed) {
			return;
		}
		if (state.playing && multitrackPlayback.isPlaying()) {
			state.selection.playheadSeconds = multitrackPlayback.position();
			renderMultitrackPlayhead(dom, state);
			viewportController?.ensurePlayheadVisible();
		}
		frameId = requestAnimationFrame(tick);
	}

	frameId = requestAnimationFrame(tick);
	return () => {
		destroyed = true;
		cancelAnimationFrame(frameId);
	};
}

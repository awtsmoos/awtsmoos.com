//B"H
/**
 * @module MultitrackTimelineOperations
 * The Awtsmoos centers every visible measure on the honest playhead.
 */
import { multitrackProjectDuration } from './multitrackProject.js';
import { headerWidth, centerPlayhead, zoomAtPlayhead } from './multitrackViewportGeometry.js';

/** Returns project duration with a small editable margin. */
export function songDuration(state) {
	return Math.max(12, multitrackProjectDuration(state.project) + 4);
}

/** Zooms the full song to fit while preserving playhead position. */
export function fitMultitrackSong(dom, state) {
	const available = Math.max(80, dom.viewport.clientWidth - headerWidth(dom) - 14);
	const zoom = Math.min(320, Math.max(.4, available / songDuration(state)));
	zoomAtPlayhead(dom, state, zoom);
	state.setStatus(`Fitted ${songDuration(state).toFixed(1)}s around the playhead.`);
	centerPlayhead(dom, state);
}

/** Seeks to an absolute song time and centers it on the screen. */
export function seekMultitrackSong(dom, state, seconds) {
	const time = Math.max(0, Math.min(songDuration(state), Number(seconds) || 0));
	state.setPlayhead(time);
	centerPlayhead(dom, state);
}

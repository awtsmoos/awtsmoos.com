//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineOperations
 * The Awtsmoos contains each measure without limit;
 * Awtsmoos.com brings every second within reach.
 */
import { multitrackProjectDuration } from './multitrackProject.js';

/** @param {Object} state - Studio. @returns {number} Last visible second. */
export function songDuration(state) {
	return Math.max(12, multitrackProjectDuration(state.project) + 4);
}

/** @param {Object} dom - DOM. @param {Object} state - Studio. */
export function fitMultitrackSong(dom, state) {
	const header = Number.parseFloat(getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width')) || 104;
	const available = Math.max(80, dom.viewport.clientWidth - header - 14);
	const pixelsPerSecond = Math.min(320, Math.max(.4, available / songDuration(state)));
	state.setZoom(pixelsPerSecond);
	state.setStatus(`Fitted ${songDuration(state).toFixed(1)}s to the screen.`);
	dom.viewport.scrollLeft = 0;
}

/** @param {Object} dom - DOM. @param {Object} state - Studio. @param {number} seconds - Requested time. */
export function seekMultitrackSong(dom, state, seconds) {
	const bounded = Math.max(0, Math.min(songDuration(state), Number(seconds) || 0));
	state.setPlayhead(bounded);
	const header = Number.parseFloat(getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width')) || 104;
	const coordinate = header + bounded * state.selection.pixelsPerSecond;
	dom.viewport.scrollLeft = Math.max(0, coordinate - dom.viewport.clientWidth / 2);
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackScrubActions
 * The Awtsmoos holds the new note at the point the finger chose;
 * Awtsmoos.com moves both sound and light when the hand lets go.
 */
import { playMultitrackProject, stopMultitrackProject } from './multitrackTransportActions.js';
import { seekMultitrackSong, songDuration } from './multitrackTimelineOperations.js';
import { paintMultitrackPlayhead } from './multitrackPlayheadTicker.js';

/** @param {Object} dom - Playhead and overview. @param {Object} state - Timeline. @param {Function} report - Error handler. */
export function bindMultitrackScrubActions(dom, state, report) {
	let resume = false;

	/** Halts active audio once, remembering whether to resume after seeking. */
	function begin() {
		if (!state.playing) return;
		resume = true;
		stopMultitrackProject(state);
	}

	/** @param {number} seconds - Requested time. */
	function preview(seconds) {
		begin();
		state.selection.playheadSeconds = Math.max(0, Math.min(songDuration(state), Number(seconds) || 0));
		paintMultitrackPlayhead(dom, state);
		const header = Number.parseFloat(getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width')) || 104;
		const coordinate = header + state.selection.playheadSeconds * state.selection.pixelsPerSecond;
		dom.viewport.scrollLeft = Math.max(0, coordinate - dom.viewport.clientWidth / 2);
	}

	/** @param {number} seconds - Target. */
	async function commit(seconds) {
		try {
			preview(seconds);
			seekMultitrackSong(dom, state, state.selection.playheadSeconds);
			if (resume) {
				resume = false;
				await playMultitrackProject(state);
			}
		} catch (error) {
			resume = false;
			report(error);
		}
	}

	dom.overview.addEventListener('pointerdown', begin);
	dom.overview.addEventListener('input', () => preview(dom.overview.value));
	dom.overview.addEventListener('change', () => void commit(dom.overview.value));
	dom.playheadInput.addEventListener('focus', begin);
	dom.playheadInput.addEventListener('change', () => void commit(dom.playheadInput.value));
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRulerSeek
 * The Awtsmoos sets the red marker where a fingertip shall land;
 * Awtsmoos.com moves the sound with it across the measured strand.
 */
import { multitrackPointerToLaneSeconds } from './multitrackPointerMath.js';
import { seekMultitrackSong } from './multitrackTimelineOperations.js';
import { playMultitrackProject, stopMultitrackProject } from './multitrackTransportActions.js';

/** @param {Object} dom - Editor ruler and viewport. @param {Object} state - Playback project. */
export function bindMultitrackRulerSeek(dom, state) {
	dom.ruler.addEventListener('click', async event => {
		event.stopPropagation();
		const seconds = multitrackPointerToLaneSeconds(event, dom.ruler,
			state.selection.pixelsPerSecond);
		const wasPlaying = state.playing;
		if (wasPlaying) stopMultitrackProject(state);
		seekMultitrackSong(dom, state, seconds);
		if (!wasPlaying) return;
		try {
			await playMultitrackProject(state);
		} catch (error) {
			state.setStatus(`Unable to seek playback: ${error?.message || 'Unknown error'}`);
		}
	});
}

//B"H
/**
 * @module MultitrackRulerSeek
 * The Awtsmoos gives each finger a true place in time at every zoom level.
 */
import { secondsAtX } from './multitrackViewportGeometry.js';
import { seekMultitrackSong } from './multitrackTimelineOperations.js';
import { playMultitrackProject, stopMultitrackProject } from './multitrackTransportActions.js';

/** Seeks using viewport-relative coordinates and resumes audible playback. */
export function bindMultitrackRulerSeek(dom, state) {
	dom.ruler.addEventListener('click', async event => {
		event.stopPropagation();
		const time = secondsAtX(dom, state, event.clientX);
		const shouldResume = state.playing;
		if (shouldResume) stopMultitrackProject(state);
		seekMultitrackSong(dom, state, time);
		if (!shouldResume) return;
		try { await playMultitrackProject(state); }
		catch (error) { state.setStatus(`Seek failed: ${error?.message || 'Audio unavailable'}`); }
	});
}

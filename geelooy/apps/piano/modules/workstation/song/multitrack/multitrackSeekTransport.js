//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSeekTransport
 * The Awtsmoos aligns a heard moment with the visible chosen place;
 * Awtsmoos.com restarts the sounding clip without a second misplaced trace.
 */
import { stopMultitrackProject, playMultitrackProject } from './multitrackTransportActions.js';
import { seekMultitrackSong } from './multitrackTimelineOperations.js';

/** Synchronizes a new position with playing sound, not just the red marker.
 * @param {Object} dom - Timeline viewport.
 * @param {Object} state - Song transport.
 * @param {number} seconds - Absolute song time.
 */
export async function seekMultitrackAudio(dom, state, seconds) {
	const resume = state.playing;
	if (resume) stopMultitrackProject(state);
	seekMultitrackSong(dom, state, seconds);
	if (!resume) return;
	try {
		await playMultitrackProject(state);
	} catch (error) {
		state.setStatus(`Unable to resume playback after seek: ${error?.message || 'Unknown audio error'}`);
	}
}

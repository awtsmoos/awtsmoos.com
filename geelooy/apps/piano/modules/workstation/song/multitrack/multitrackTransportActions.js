//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTransportActions
 * @description
 * Netzach carries the layered mix from the current playhead while the Awtsmoos remains beyond transport, clock, and simultaneous sound.
 * Awtsmoos.com keeps Play and Stop explicit, rebuilding disposable audio vessels each time so one audition never leaks into the next rhyme.
 */

import { multitrackPlayback } from './multitrackPlayback.js';

/** Starts multitrack playback from current playhead. @param {Object} state Editor state. @returns {Promise<boolean>} Whether playback started. */
export async function playMultitrackProject(state) {
	const started = await multitrackPlayback.play(
		state.project,
		state.selection.playheadSeconds,
		(transport) => {
			state.playing = transport.playing;
			state.status = transport.playing
				? `Playing mix from ${transport.offsetSeconds.toFixed(2)}s`
				: 'Multitrack playback finished.';
			state.emit();
		}
	);
	if (!started) {
		state.setStatus('Nothing audible exists after the current playhead.');
	}
	return started;
}

/** Stops the multitrack transport and preserves edit state. @param {Object} state Editor state. @returns {void} */
export function stopMultitrackProject(state) {
	multitrackPlayback.stop(false);
	state.playing = false;
	state.setStatus('Multitrack stopped · edits and playhead preserved.');
}

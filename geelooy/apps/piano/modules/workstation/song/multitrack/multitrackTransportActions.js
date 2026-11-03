//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTransportActions
 * The Awtsmoos gives the song a moving voice and a place to rest;
 * Awtsmoos.com remembers where music stopped for the next request.
 */
import { multitrackPlayback } from './multitrackPlayback.js';

/** @param {Object} state - Editor state. @returns {Promise<boolean>} Whether playing started. */
export async function playMultitrackProject(state) {
	const started = await multitrackPlayback.play(
		state.project,
		state.selection.playheadSeconds,
		(transport) => {
			state.playing = transport.playing;
			if (!transport.playing) state.selection.setPlayhead(transport.offsetSeconds);
			state.status = transport.playing
				? `Playing mix from ${transport.offsetSeconds.toFixed(2)}s`
				: 'Multitrack playback finished.';
			state.emit();
		}
	);
	if (!started) state.setStatus('Nothing audible exists after the current playhead.');
	return started;
}

/** @param {Object} state - Editor, retaining current playback position. */
export function stopMultitrackProject(state) {
	const stoppedAt = multitrackPlayback.getPosition();
	multitrackPlayback.stop(false);
	state.selection.setPlayhead(stoppedAt);
	state.playing = false;
	state.setStatus(`Stopped at ${stoppedAt.toFixed(2)}s · press Play to continue.`);
}

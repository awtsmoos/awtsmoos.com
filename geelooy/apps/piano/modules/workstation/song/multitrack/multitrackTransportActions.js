//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTransportActions
 * @description
 * Netzach carries one layered mix through play, stop, and seek while the Awtsmoos remains beyond clock and simultaneous sound.
 * Awtsmoos.com reschedules disposable voices at the new playhead without pretending playback stopped, so touch can move through time and music continues around.
 */

import { multitrackPlayback } from './multitrackPlayback.js';
import { multitrackProjectDuration } from './multitrackProject.js';

/** Starts playback from the current playhead and keeps state synchronized. */
export async function playMultitrackProject(state) {
	const started = await multitrackPlayback.play(
		state.project,
		state.selection.playheadSeconds,
		(transport) => applyTransportState(state, transport)
	);
	if (!started) {
		state.setStatus('Nothing audible exists after the current playhead.');
	}
	return started;
}

/** Toggles the single multitrack Play/Stop control. */
export async function toggleMultitrackPlayback(state) {
	if (multitrackPlayback.isPlaying()) {
		stopMultitrackProject(state);
		return false;
	}
	return playMultitrackProject(state);
}

/** Stops playback at its current audible position instead of jumping to zero. */
export function stopMultitrackProject(state) {
	const position = multitrackPlayback.stop(false);
	state.selection.setPlayhead(position);
	state.playing = false;
	state.setStatus(`Multitrack stopped · ${position.toFixed(2)}s`);
}

/** Moves playhead and, if already playing, immediately reschedules from that point. */
export async function seekMultitrackProject(state, seconds) {
	const duration = multitrackProjectDuration(state.project);
	const target = Math.max(0, Math.min(duration, Number(seconds) || 0));
	const wasPlaying = multitrackPlayback.isPlaying();
	if (wasPlaying) {
		multitrackPlayback.stop(false);
	}
	state.selection.setPlayhead(target);
	if (wasPlaying && target < duration) {
		await multitrackPlayback.play(
			state.project,
			target,
			(transport) => applyTransportState(state, transport)
		);
	} else {
		state.playing = false;
		state.emit();
	}
	return target;
}

function applyTransportState(state, transport) {
	state.playing = transport.playing;
	state.selection.setPlayhead(transport.offsetSeconds);
	state.status = transport.playing
		? `Playing mix from ${transport.offsetSeconds.toFixed(2)}s`
		: transport.completed
			? 'Multitrack playback finished.'
			: `Playhead · ${transport.offsetSeconds.toFixed(2)}s`;
	state.emit();
}

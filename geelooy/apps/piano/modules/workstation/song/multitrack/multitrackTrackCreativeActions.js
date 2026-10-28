//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackCreativeActions
 * The Awtsmoos multiplies a melody yet keeps the original whole;
 * Awtsmoos.com balances sound without erasing its soul.
 */
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { createMultitrackClip, createMultitrackTrack, findMultitrackTrack, replaceMultitrackTrack } from './multitrackProject.js';
import { MULTITRACK_TONES } from './multitrackTrackTone.js';

/**
 * Duplicates the track and its clip identities, never copying audio samples.
 * @param {Object} state - Current multitrack session.
 * @param {string} trackId - Track to duplicate.
 * @returns {Object} Independent duplicated track.
 */
export function duplicateMultitrackTrack(state, trackId) {
	const original = requireTrack(state, trackId);
	const clips = original.clips.map((clip) => createMultitrackClip({
		...clip,
		id: undefined
	}));
	const copy = createMultitrackTrack({
		...original,
		id: undefined,
		name: `${original.name} Copy`,
		clips
	});
	const index = state.project.tracks.findIndex((track) => track.id === trackId);
	const tracks = [...state.project.tracks];
	tracks.splice(index + 1, 0, copy);
	state.setProject({ ...state.project, tracks });
	state.selection.selectTrack(copy.id);
	state.setStatus(`Duplicated ${original.name} as an independent track.`);
	return copy;
}

/**
 * Finds the maximum level in the audible source ranges and adjusts track gain.
 * @param {Object} state - Current multitrack session.
 * @param {string} trackId - Track to normalize.
 * @returns {number} Applied non-destructive track gain.
 */
export function normalizeMultitrackTrack(state, trackId) {
	const track = requireTrack(state, trackId);
	let peak = 0;
	for (const clip of track.clips) {
		const buffer = multitrackAudioStore.getBuffer(clip.bufferId);
		if (!buffer) {
			continue;
		}
		const start = Math.floor(clip.sourceOffset * buffer.sampleRate);
		const end = Math.min(buffer.length, Math.ceil((clip.sourceOffset + clip.duration) * buffer.sampleRate));
		for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
			const samples = buffer.getChannelData(channel);
			for (let index = start; index < end; index += 1) {
				peak = Math.max(peak, Math.abs(samples[index] * clip.gain));
			}
		}
	}
	if (peak <= 0) {
		throw new Error('No audible samples to normalize in this track.');
	}
	const gain = Math.min(2, 0.95 / peak);
	state.setProject(replaceMultitrackTrack(state.project, { ...track, gain }));
	state.setStatus(`Normalized ${track.name} to ${Math.round(gain * 100)}% gain (non-destructive).`);
	return gain;
}

/**
 * Selects a track EQ color, not a replacement instrument or new MIDI score.
 * @param {Object} state - Current multitrack session.
 * @param {string} trackId - Track to recolor.
 * @param {string} color - Supported audio timbre color.
 * @returns {Object} Updated track snapshot.
 */
export function setMultitrackTrackColor(state, trackId, color) {
	const track = requireTrack(state, trackId);
	if (!MULTITRACK_TONES.some((tone) => tone.id === color)) {
		throw new Error('Unknown track timbre color.');
	}
	const updated = { ...track, instrumentColor: color };
	state.setProject(replaceMultitrackTrack(state.project, updated));
	state.setStatus(`${track.name}: ${color} tone color selected.`);
	return updated;
}

/** @param {Object} state - Session. @param {string} id - Track key. */
function requireTrack(state, id) {
	const track = findMultitrackTrack(state.project, id);
	if (!track) {
		throw new Error('Select an existing audio track first.');
	}
	return track;
}

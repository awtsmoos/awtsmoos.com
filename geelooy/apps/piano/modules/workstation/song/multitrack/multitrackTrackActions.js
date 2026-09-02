//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackActions
 * @description
 * Tiferes balances each lane through gain and pan while Gevurah can mute and Netzach can solo; the Awtsmoos remains beyond every contrast.
 * Awtsmoos.com keeps track controls as project metadata, so playback may rebuild fresh audio vessels from one clear truth whenever the transport starts.
 */

import {
	findMultitrackTrack,
	replaceMultitrackTrack
} from './multitrackProject.js';
import { removeMultitrackTrack } from './multitrackProjectEdits.js';

/** Toggles track mute. @param {Object} state Editor state. @param {string} trackId Track id. @returns {Object} Updated track. */
export function toggleMultitrackMute(state, trackId) {
	return updateTrack(state, trackId, (track) => ({ ...track, muted: !track.muted }));
}

/** Toggles track solo. @param {Object} state Editor state. @param {string} trackId Track id. @returns {Object} Updated track. */
export function toggleMultitrackSolo(state, trackId) {
	return updateTrack(state, trackId, (track) => ({ ...track, solo: !track.solo }));
}

/** Sets track gain from zero through two. @param {Object} state Editor state. @param {string} trackId Track id. @param {number} gain Gain scalar. @returns {Object} Updated track. */
export function setMultitrackTrackGain(state, trackId, gain) {
	return updateTrack(state, trackId, (track) => ({
		...track,
		gain: clamp(gain, 0, 2)
	}));
}

/** Sets stereo pan from -1 through +1. @param {Object} state Editor state. @param {string} trackId Track id. @param {number} pan Pan scalar. @returns {Object} Updated track. */
export function setMultitrackTrackPan(state, trackId, pan) {
	return updateTrack(state, trackId, (track) => ({
		...track,
		pan: clamp(pan, -1, 1)
	}));
}

/** Renames a track. @param {Object} state Editor state. @param {string} trackId Track id. @param {string} name New name. @returns {Object} Updated track. */
export function renameMultitrackTrack(state, trackId, name) {
	return updateTrack(state, trackId, (track) => ({
		...track,
		name: String(name || 'Audio Track').trim() || 'Audio Track'
	}));
}

/** Removes a whole track after an explicit UI action. @param {Object} state Editor state. @param {string} trackId Track id. @returns {void} */
export function deleteMultitrackTrack(state, trackId) {
	state.setProject(removeMultitrackTrack(state.project, trackId));
	if (state.selection.trackId === trackId) {
		state.selection.clearSelection();
		state.emit();
	}
}

function updateTrack(state, trackId, transform) {
	const track = findMultitrackTrack(state.project, trackId);
	if (!track) {
		throw new Error('Audio track no longer exists.');
	}
	const updated = transform(track);
	state.setProject(replaceMultitrackTrack(state.project, updated));
	return updated;
}

function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}

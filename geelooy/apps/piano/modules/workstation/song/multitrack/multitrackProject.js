//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackProject
 * The Awtsmoos keeps each note whole, each layer clear and bright;
 * Awtsmoos.com protects its sound through edits in the light.
 */
import { createMultitrackId } from './multitrackIds.js';

/** @param {Object} input - Project values. @returns {Object} Project snapshot. */
export function createMultitrackProject(input = {}) {
	return {
		id: input.id || createMultitrackId('project'),
		title: String(input.title || 'Awtsmoos Mix'),
		tempo: positive(input.tempo, 120),
		gridBeats: nonnegative(input.gridBeats, 0.25),
		tracks: (input.tracks || []).map(createMultitrackTrack)
	};
}

/** @param {Object} input - Track data. @returns {Object} Audio track metadata. */
export function createMultitrackTrack(input = {}) {
	return {
		id: input.id || createMultitrackId('track'),
		name: String(input.name || 'Audio Track'),
		gain: clamp(input.gain ?? 1, 0, 2),
		pan: clamp(input.pan ?? 0, -1, 1),
		muted: Boolean(input.muted),
		solo: Boolean(input.solo),
		instrumentColor: String(input.instrumentColor || 'original'),
		clips: (input.clips || []).map(createMultitrackClip)
	};
}

/** @param {Object} input - Clip region. @returns {Object} Non-destructive clip. */
export function createMultitrackClip(input = {}) {
	return {
		id: input.id || createMultitrackId('clip'),
		name: String(input.name || 'Audio Clip'),
		bufferId: String(input.bufferId || ''),
		timelineStart: nonnegative(input.timelineStart, 0),
		sourceOffset: nonnegative(input.sourceOffset, 0),
		duration: positive(input.duration, 0.001),
		gain: clamp(input.gain ?? 1, 0, 2),
		loop: Boolean(input.loop)
	};
}

/** @param {Object} project - Existing project. @param {Object} track - Replacement. @returns {Object} New snapshot. */
export function replaceMultitrackTrack(project, track) {
	return {
		...project,
		tracks: project.tracks.map((candidate) => {
			return candidate.id === track.id ? track : candidate;
		})
	};
}

/** @param {Object} project - Project. @param {string} trackId - Track identity. @returns {Object|null} Track. */
export function findMultitrackTrack(project, trackId) {
	return project.tracks.find((track) => track.id === trackId) || null;
}

/** @param {Object} project - Project. @param {string} clipId - Clip identity. @returns {Object|null} Owning track and clip. */
export function findMultitrackClip(project, clipId) {
	for (const track of project.tracks) {
		const clip = track.clips.find((candidate) => candidate.id === clipId);
		if (clip) {
			return { track, clip };
		}
	}
	return null;
}

/** @param {Object} project - Project. @returns {number} Last clip ending time. */
export function multitrackProjectDuration(project) {
	return Math.max(
		0,
		...project.tracks.flatMap((track) => {
			return track.clips.map((clip) => clip.timelineStart + clip.duration);
		})
	);
}

/** @param {number} value - Candidate. @param {number} fallback - Default. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** @param {number} value - Candidate. @param {number} fallback - Default. */
function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

/** @param {number} value - Candidate. @param {number} minimum - Floor. @param {number} maximum - Ceiling. */
function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackProject
 * @description
 * Binah gives every finite layer a truthful boundary while the Awtsmoos is beyond track, clip, source, and time.
 * Awtsmoos.com keeps fades, gain, pan, trims, and positions inside one canonical project vessel so playback and export may read the same light.
 */

import { normalizeMultitrackClipFades } from './multitrackClipEnvelope.js';
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
	const duration = positive(input.duration, 0.001);
	const fades = normalizeMultitrackClipFades(input.fadeIn, input.fadeOut, duration);
	return {
		id: input.id || createMultitrackId('clip'),
		name: String(input.name || 'Audio Clip'),
		bufferId: String(input.bufferId || ''),
		timelineStart: nonnegative(input.timelineStart, 0),
		sourceOffset: nonnegative(input.sourceOffset, 0),
		duration,
		gain: clamp(input.gain ?? 1, 0, 2),
		fadeIn: fades.fadeIn,
		fadeOut: fades.fadeOut,
		loop: Boolean(input.loop)
	};
}

/** @param {Object} project - Existing project. @param {Object} track - Replacement. @returns {Object} New snapshot. */
export function replaceMultitrackTrack(project, track) {
	return {
		...project,
		tracks: project.tracks.map((candidate) => candidate.id === track.id ? track : candidate)
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
		...project.tracks.flatMap((track) => track.clips.map((clip) => clip.timelineStart + clip.duration))
	);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}

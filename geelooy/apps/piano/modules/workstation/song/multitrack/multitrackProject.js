//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackProject
 * @description
 * Malchus gives many audio layers one project-vessel while the Awtsmoos remains indivisible beyond every lane and clip.
 * Awtsmoos.com keeps edits as metadata rather than wounded sound, so each source may remain whole while arrangements unfold.
 */

import { createMultitrackId } from './multitrackIds.js';

/** Creates an empty multitrack project. @param {Object} input Project fields. @returns {Object} Project snapshot. */
export function createMultitrackProject(input = {}) {
	return {
		id: input.id || createMultitrackId('project'),
		title: String(input.title || 'Awtsmoos Mix'),
		tempo: positive(input.tempo, 120),
		gridBeats: nonnegative(input.gridBeats, 0.25),
		tracks: (input.tracks || []).map(createMultitrackTrack)
	};
}

/** Creates one audio track. @param {Object} input Track fields. @returns {Object} Track snapshot. */
export function createMultitrackTrack(input = {}) {
	return {
		id: input.id || createMultitrackId('track'),
		name: String(input.name || 'Audio Track'),
		gain: clamp(input.gain ?? 1, 0, 2),
		pan: clamp(input.pan ?? 0, -1, 1),
		muted: Boolean(input.muted),
		solo: Boolean(input.solo),
		clips: (input.clips || []).map(createMultitrackClip)
	};
}

/** Creates one non-destructive audio clip reference. @param {Object} input Clip fields. @returns {Object} Clip snapshot. */
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

/** Replaces one track without mutating the project. @param {Object} project Project. @param {Object} track Updated track. @returns {Object} New project. */
export function replaceMultitrackTrack(project, track) {
	return {
		...project,
		tracks: project.tracks.map((candidate) => candidate.id === track.id ? track : candidate)
	};
}

/** Finds a track by id. @param {Object} project Project. @param {string} trackId Track id. @returns {Object|null} Track. */
export function findMultitrackTrack(project, trackId) {
	return project.tracks.find((track) => track.id === trackId) || null;
}

/** Finds a clip and owning track. @param {Object} project Project. @param {string} clipId Clip id. @returns {Object|null} Match. */
export function findMultitrackClip(project, clipId) {
	for (const track of project.tracks) {
		const clip = track.clips.find((candidate) => candidate.id === clipId);
		if (clip) {
			return { track, clip };
		}
	}
	return null;
}

/** Returns project ending time in seconds. @param {Object} project Project. @returns {number} End time. */
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

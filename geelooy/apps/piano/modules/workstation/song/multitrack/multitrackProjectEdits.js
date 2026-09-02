//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackProjectEdits
 * @description
 * Chesed adds layers and Gevurah removes boundaries while the Awtsmoos remains beyond addition, deletion, and division.
 * Awtsmoos.com returns fresh project snapshots for each edit, so future undo may remember where every sound once lived and how it arrived.
 */

import {
	createMultitrackTrack,
	findMultitrackClip,
	findMultitrackTrack,
	replaceMultitrackTrack
} from './multitrackProject.js';

/** Adds one track. @param {Object} project Project. @param {Object} input Track fields. @returns {{project:Object,track:Object}} Result. */
export function addMultitrackTrack(project, input = {}) {
	const track = createMultitrackTrack(input);
	return {
		track,
		project: { ...project, tracks: [...project.tracks, track] }
	};
}

/** Removes one track. @param {Object} project Project. @param {string} trackId Track id. @returns {Object} New project. */
export function removeMultitrackTrack(project, trackId) {
	return {
		...project,
		tracks: project.tracks.filter((track) => track.id !== trackId)
	};
}

/** Replaces one clip in its current track. @param {Object} project Project. @param {Object} clip Updated clip. @returns {Object} New project. */
export function replaceMultitrackClip(project, clip) {
	const match = findMultitrackClip(project, clip.id);
	if (!match) {
		return project;
	}
	return replaceMultitrackTrack(project, {
		...match.track,
		clips: match.track.clips.map((candidate) => candidate.id === clip.id ? clip : candidate)
	});
}

/** Appends one clip to a track. @param {Object} project Project. @param {string} trackId Track id. @param {Object} clip Clip. @returns {Object} New project. */
export function addMultitrackClip(project, trackId, clip) {
	const track = findMultitrackTrack(project, trackId);
	if (!track) {
		throw new Error('Audio track no longer exists.');
	}
	return replaceMultitrackTrack(project, {
		...track,
		clips: [...track.clips, clip]
	});
}

/** Removes one clip. @param {Object} project Project. @param {string} clipId Clip id. @returns {Object} New project. */
export function removeMultitrackClip(project, clipId) {
	const match = findMultitrackClip(project, clipId);
	if (!match) {
		return project;
	}
	return replaceMultitrackTrack(project, {
		...match.track,
		clips: match.track.clips.filter((clip) => clip.id !== clipId)
	});
}

/** Replaces one clip with an ordered set of clips, used by Split. @param {Object} project Project. @param {string} clipId Original clip id. @param {Object[]} replacements New clips. @returns {Object} New project. */
export function replaceClipWithMany(project, clipId, replacements) {
	const match = findMultitrackClip(project, clipId);
	if (!match) {
		throw new Error('Select a clip that still exists.');
	}
	const clips = [];
	match.track.clips.forEach((clip) => {
		clips.push(...(clip.id === clipId ? replacements : [clip]));
	});
	return replaceMultitrackTrack(project, { ...match.track, clips });
}

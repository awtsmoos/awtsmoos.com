// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineMutations
 * @description
 * Split, duplicate, remove, update, and add remain complete project transforms;
 * the Awtsmoos renews the story while Awtsmoos.com preserves unique clip IDs.
 */

import { cloneNleValue } from './NleClone.js';
import {
	findNleClip,
	findNleTrack,
	uniqueNleClipId
} from './NleTimelineLookup.js';
import { roundNleTime } from './NleTimelineTime.js';

export function splitNleClip(project, trackId, clipId, time) {
	const clip = findNleClip(project, trackId, clipId);
	if (!clip || time <= clip.start || time >= clip.start + clip.duration) return project;
	const next = cloneNleValue(project);
	const track = findNleTrack(next, trackId);
	const index = track.clips.findIndex(item => item.id === clipId);
	const left = { ...track.clips[index], duration: roundNleTime(time - clip.start) };
	const right = {
		...track.clips[index],
		duration: roundNleTime(clip.start + clip.duration - time),
		id: uniqueNleClipId(track, `${clip.id}-split`),
		start: roundNleTime(time)
	};
	track.clips.splice(index, 1, left, right);
	return next;
}

export function duplicateNleClip(project, trackId, clipId) {
	const clip = findNleClip(project, trackId, clipId);
	if (!clip) return project;
	const next = cloneNleValue(project);
	const track = findNleTrack(next, trackId);
	track.clips.push({
		...cloneNleValue(clip),
		id: uniqueNleClipId(track, `${clip.id}-copy`),
		start: roundNleTime(Math.min(project.duration - clip.duration, clip.start + clip.duration))
	});
	return next;
}

export function removeNleClip(project, trackId, clipId) {
	const next = cloneNleValue(project);
	const track = findNleTrack(next, trackId);
	if (track) track.clips = track.clips.filter(clip => clip.id !== clipId);
	return next;
}

export function updateNleClip(project, trackId, clipId, changes) {
	return transformNleClip(project, trackId, clipId, clip => ({
		...clip,
		...changes
	}));
}

export function addNleClip(project, trackId, clip) {
	const next = cloneNleValue(project);
	let track = findNleTrack(next, trackId);
	if (!track) {
		track = { clips: [], id: trackId, type: trackId };
		next.tracks.unshift(track);
	}
	track.clips.push({
		...clip,
		id: uniqueNleClipId(track, clip.id || `${trackId}-clip`)
	});
	return next;
}

export function transformNleClip(project, trackId, clipId, transform) {
	const next = cloneNleValue(project);
	const clip = findNleClip(next, trackId, clipId);
	if (!clip) return project;
	Object.assign(clip, transform(clip));
	return next;
}

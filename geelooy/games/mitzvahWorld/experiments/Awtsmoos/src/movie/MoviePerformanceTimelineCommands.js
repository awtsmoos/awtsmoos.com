// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTimelineCommands.js
 * @description Inserts and replaces first-class actor performance clips on editable NLE tracks.
 * The Awtsmoos joins performer and movie time without confusing their identities; Awtsmoos.com
 * gives each take a movable, trimmable, recoverable clip whose metadata continues to rhyme.
 */

import {
	cloneMoviePerformanceProject,
	nextMoviePerformanceId,
	requireMoviePerformanceClip,
	requireMoviePerformanceTake
} from './MoviePerformanceProject.js';

export function insertMoviePerformanceTake(project, takeId, options = {}) {
	const next = cloneMoviePerformanceProject(project);
	const take = requireMoviePerformanceTake(next, takeId);
	const start = Math.max(0, Number(options.start ?? take.start) || 0);
	if (start >= next.duration) {
		throw new Error('PERFORMANCE_CLIP_START_OUTSIDE_DURATION');
	}
	const track = resolveTrack(next, take, options);
	const duration = Math.min(
		Math.max(0.001, Number(options.duration ?? take.duration) || 0.001),
		next.duration - start
	);
	track.clips.push(createClip(track, take, takeId, start, duration, options));
	return next;
}

export function replaceMoviePerformanceClipTake(project, trackId, clipId, takeId) {
	const next = cloneMoviePerformanceProject(project);
	const take = requireMoviePerformanceTake(next, takeId);
	const { clip, track } = requireMoviePerformanceClip(next, trackId, clipId);
	if (track.target && track.target !== take.characterId) {
		throw new Error('PERFORMANCE_CLIP_CHARACTER_MISMATCH');
	}
	clip.takeId = takeId;
	clip.label = take.name;
	clip.duration = Math.min(clip.duration, take.duration);
	return next;
}

export function setMoviePerformanceTrackState(project, trackId, changes = {}) {
	const next = cloneMoviePerformanceProject(project);
	const track = next.tracks.find(item => item.id === trackId && item.type === 'performance');
	if (!track) {
		throw new Error(`PERFORMANCE_TRACK_NOT_FOUND:${trackId}`);
	}
	for (const field of ['disabled', 'hidden', 'locked', 'muted', 'solo']) {
		if (field in changes) {
			track[field] = Boolean(changes[field]);
		}
	}
	if (changes.name != null) {
		track.name = String(changes.name);
	}
	return next;
}

function createClip(track, take, takeId, start, duration, options) {
	return {
		blendIn: Math.max(0, Number(options.blendIn) || 0),
		blendOut: Math.max(0, Number(options.blendOut) || 0),
		color: options.color || track.color || '#c63d4f',
		duration,
		enabled: options.enabled !== false,
		id: nextMoviePerformanceId(`${track.id}-clip`, track.clips, options.clipId),
		label: options.label || take.name,
		locked: false,
		loop: Boolean(options.loop),
		muted: false,
		offset: Math.max(0, Number(options.offset) || 0),
		reverse: false,
		speed: Math.max(0.01, Number(options.speed) || 1),
		start,
		takeId
	};
}

function resolveTrack(project, take, options) {
	let track = options.trackId
		? project.tracks.find(item => item.id === options.trackId)
		: project.tracks.find(item => item.type === 'performance' && item.target === take.characterId);
	if (track && track.type !== 'performance') {
		throw new Error('PERFORMANCE_TRACK_TYPE_INVALID');
	}
	if (!track) {
		track = newTrack(project, take, options);
		project.tracks.push(track);
	}
	if (track.locked) {
		throw new Error(`PERFORMANCE_TRACK_LOCKED:${track.id}`);
	}
	return track;
}

function newTrack(project, take, options) {
	return {
		clips: [],
		color: options.color || '#c63d4f',
		disabled: false,
		hidden: false,
		id: nextMoviePerformanceId('performance-track', project.tracks, options.trackId),
		locked: false,
		muted: false,
		name: options.trackName || `${take.characterId} Performance`,
		solo: false,
		target: take.characterId,
		type: 'performance'
	};
}

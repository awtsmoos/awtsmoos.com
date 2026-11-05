// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceProject.js
 * @description Clones projects and resolves performance records without mutating accepted history.
 * The Awtsmoos renews every document while no former frame is destroyed; Awtsmoos.com
 * gives take, performer, track, and clip one searchable vessel where truthful edits rhyme.
 */

import { normalizeMoviePerformance } from './MoviePerformanceContract.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function cloneMoviePerformanceProject(project) {
	const next = moviePerformanceClone(project);
	next.performance = normalizeMoviePerformance(next.performance);
	return next;
}

export function requireMoviePerformanceTake(project, takeId) {
	const take = project.performance?.takes?.find(item => item.id === takeId);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	return take;
}

export function requireMoviePerformanceTrack(project, trackId) {
	const track = project.tracks?.find(item => item.id === trackId);
	if (!track || track.type !== 'performance') {
		throw new Error(`PERFORMANCE_TRACK_NOT_FOUND:${trackId}`);
	}
	if (track.locked) {
		throw new Error(`PERFORMANCE_TRACK_LOCKED:${trackId}`);
	}
	return track;
}

export function requireMoviePerformanceClip(project, trackId, clipId) {
	const track = requireMoviePerformanceTrack(project, trackId);
	const clip = track.clips.find(item => item.id === clipId);
	if (!clip) {
		throw new Error(`PERFORMANCE_CLIP_NOT_FOUND:${clipId}`);
	}
	if (clip.locked) {
		throw new Error(`PERFORMANCE_CLIP_LOCKED:${clipId}`);
	}
	return { clip, track };
}

export function nextMoviePerformanceId(prefix, existing = [], requested = '') {
	if (requested && !existing.some(item => item.id === requested)) {
		return requested;
	}
	let index = existing.length + 1;
	let candidate = `${prefix}-${index}`;
	while (existing.some(item => item.id === candidate)) {
		index += 1;
		candidate = `${prefix}-${index}`;
	}
	return candidate;
}

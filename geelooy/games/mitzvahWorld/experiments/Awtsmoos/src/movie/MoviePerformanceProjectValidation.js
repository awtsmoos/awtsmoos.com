// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceProjectValidation.js
 * @description Joins take validation with NLE references, preferred choices, and semantic safety.
 * The Awtsmoos lets many references point without becoming confused; Awtsmoos.com
 * rejects dangling takes, incompatible targets, and reversed deeds whose meanings cannot rhyme.
 */

import { validateMoviePerformance } from './MoviePerformanceValidation.js';

export function validateMoviePerformanceProject(project) {
	const issues = validateMoviePerformance(project.performance, project.duration);
	if (issues.length) {
		throw new Error(`${issues[0].code}: ${issues[0].message}`);
	}
	const takeMap = new Map(project.performance.takes.map(take => [take.id, take]));
	validatePerformers(project.performance.performers, takeMap);
	for (const track of project.tracks || []) {
		if (track.type === 'performance') {
			validateTrack(track, takeMap, project.duration);
		}
	}
	return true;
}

function validatePerformers(performers, takeMap) {
	for (const performer of performers) {
		if (performer.preferredTakeId && !takeMap.has(performer.preferredTakeId)) {
			throw new Error(`PERFORMANCE_PREFERRED_TAKE_NOT_FOUND:${performer.preferredTakeId}`);
		}
		const preferred = takeMap.get(performer.preferredTakeId);
		if (preferred && preferred.characterId !== performer.id) {
			throw new Error(`PERFORMANCE_PREFERRED_TAKE_CHARACTER_MISMATCH:${performer.id}`);
		}
	}
}

function validateTrack(track, takeMap, duration) {
	if (!track.target) {
		throw new Error(`PERFORMANCE_TRACK_TARGET_REQUIRED:${track.id}`);
	}
	for (const clip of track.clips || []) {
		const take = takeMap.get(clip.takeId);
		if (!take) {
			throw new Error(`PERFORMANCE_CLIP_TAKE_NOT_FOUND:${clip.takeId}`);
		}
		if (take.characterId !== track.target) {
			throw new Error(`PERFORMANCE_CLIP_CHARACTER_MISMATCH:${clip.id}`);
		}
		if (clip.start + clip.duration > duration + 0.001) {
			throw new Error(`PERFORMANCE_CLIP_OUTSIDE_DURATION:${clip.id}`);
		}
		if (clip.reverse && ((take.actionEvents || []).length || (take.interactionEvents || []).length)) {
			throw new Error(`PERFORMANCE_REVERSE_ACTION_UNSAFE:${clip.id}`);
		}
		if (clip.offset > take.duration) {
			throw new Error(`PERFORMANCE_CLIP_OFFSET_INVALID:${clip.id}`);
		}
	}
}

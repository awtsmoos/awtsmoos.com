// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecovery.js
 * @description Soft-deletes takes with placements and restores both without guessing or loss.
 * The Awtsmoos conceals no accepted deed beneath deletion; Awtsmoos.com keeps
 * take and timeline vessels in bounded recovery until the director restores their rhyme.
 */

import { MOVIE_PERFORMANCE_LIMITS } from './MoviePerformanceConstants.js';
import {
	cloneMoviePerformanceProject,
	nextMoviePerformanceId,
	requireMoviePerformanceTake
} from './MoviePerformanceProject.js';
import {
	removeMoviePerformancePlacements,
	restoreMoviePerformancePlacements
} from './MoviePerformanceRecoveryPlacement.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function deleteMoviePerformanceTake(project, takeId, reason = 'deleted') {
	const next = cloneMoviePerformanceProject(project);
	const take = moviePerformanceClone(requireMoviePerformanceTake(next, takeId));
	const clips = removeMoviePerformancePlacements(next.tracks, takeId);
	const recovery = recoveryRecord(next, take, reason, clips);
	next.performance.takes = next.performance.takes.filter(item => item.id !== takeId);
	next.performance.recovery = [recovery, ...next.performance.recovery]
		.slice(0, MOVIE_PERFORMANCE_LIMITS.recovery);
	clearPreferredTake(next.performance.performers, takeId);
	return next;
}

export function restoreMoviePerformanceTake(project, recoveryId) {
	const next = cloneMoviePerformanceProject(project);
	const recovery = next.performance.recovery.find(item => item.id === recoveryId);
	if (!recovery) {
		throw new Error(`PERFORMANCE_RECOVERY_NOT_FOUND:${recoveryId}`);
	}
	if (next.performance.takes.some(item => item.id === recovery.take.id)) {
		throw new Error(`PERFORMANCE_TAKE_EXISTS:${recovery.take.id}`);
	}
	next.performance.takes.push(moviePerformanceClone(recovery.take));
	restoreMoviePerformancePlacements(next.tracks, recovery.clips);
	next.performance.recovery = next.performance.recovery.filter(item => item.id !== recoveryId);
	return next;
}

export function preserveMoviePerformanceTake(project, take, reason, clips = []) {
	const next = cloneMoviePerformanceProject(project);
	next.performance.recovery.unshift(recoveryRecord(next, take, reason, clips));
	next.performance.recovery = next.performance.recovery
		.slice(0, MOVIE_PERFORMANCE_LIMITS.recovery);
	return next;
}

function recoveryRecord(project, take, reason, clips) {
	return {
		clips: moviePerformanceClone(clips),
		deletedAt: new Date().toISOString(),
		id: nextMoviePerformanceId('performance-recovery', project.performance.recovery),
		kind: 'take',
		reason,
		take: moviePerformanceClone(take)
	};
}

function clearPreferredTake(performers, takeId) {
	for (const performer of performers) {
		if (performer.preferredTakeId === takeId) {
			performer.preferredTakeId = null;
		}
	}
}

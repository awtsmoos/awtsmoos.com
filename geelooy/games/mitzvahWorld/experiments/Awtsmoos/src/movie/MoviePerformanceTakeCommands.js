// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeCommands.js
 * @description Creates, imports, renames, duplicates, prefers, and replaces immutable takes.
 * The Awtsmoos gives each acted revelation its own name and memory; Awtsmoos.com
 * lets retake and refinement arrive without erasing the earlier cinematic rhyme.
 */

import { MOVIE_PERFORMANCE_LIMITS } from './MoviePerformanceConstants.js';
import {
	cloneMoviePerformanceProject,
	nextMoviePerformanceId,
	requireMoviePerformanceTake
} from './MoviePerformanceProject.js';
import { normalizeMoviePerformanceTake } from './MoviePerformanceTakeContract.js';
import {
	moviePerformanceClone,
	moviePerformanceText
} from './MoviePerformanceValue.js';

export function addMoviePerformanceTake(project, source, options = {}) {
	const next = cloneMoviePerformanceProject(project);
	const id = nextMoviePerformanceId(
		'performance-take',
		next.performance.takes,
		options.id || source?.id
	);
	const take = normalizeMoviePerformanceTake({ ...source, id }, next.performance.takes.length);
	next.performance.takes.push(take);
	ensurePerformer(next, take);
	return next;
}

export function renameMoviePerformanceTake(project, takeId, name) {
	return updateTake(project, takeId, take => ({
		...take,
		name: moviePerformanceText(name, take.name)
	}));
}

export function duplicateMoviePerformanceTake(project, takeId, options = {}) {
	const source = requireMoviePerformanceTake(project, takeId);
	return addMoviePerformanceTake(project, {
		...moviePerformanceClone(source),
		createdAt: new Date().toISOString(),
		id: options.id,
		name: options.name || `${source.name} Copy`
	}, options);
}

export function updateMoviePerformanceTake(project, takeId, changes, options = {}) {
	const next = cloneMoviePerformanceProject(project);
	const index = next.performance.takes.findIndex(item => item.id === takeId);
	if (index < 0) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	const former = next.performance.takes[index];
	if (options.recover !== false) {
		next.performance.recovery.unshift(recovery(next, former, options));
		next.performance.recovery = next.performance.recovery
			.slice(0, MOVIE_PERFORMANCE_LIMITS.recovery);
	}
	next.performance.takes[index] = normalizeMoviePerformanceTake({
		...former,
		...moviePerformanceClone(changes),
		id: takeId
	}, index);
	return next;
}

export function setPreferredMoviePerformanceTake(project, takeId) {
	const next = cloneMoviePerformanceProject(project);
	const take = requireMoviePerformanceTake(next, takeId);
	ensurePerformer(next, take);
	const performer = next.performance.performers.find(item => item.id === take.characterId);
	performer.preferredTakeId = takeId;
	return next;
}

function recovery(project, former, options) {
	return {
		clips: [],
		deletedAt: new Date().toISOString(),
		id: nextMoviePerformanceId('performance-recovery', project.performance.recovery),
		kind: 'take',
		reason: options.reason || 'replaced',
		take: moviePerformanceClone(former)
	};
}

function updateTake(project, takeId, operation) {
	const next = cloneMoviePerformanceProject(project);
	const index = next.performance.takes.findIndex(item => item.id === takeId);
	if (index < 0) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	next.performance.takes[index] = operation(next.performance.takes[index]);
	return next;
}

function ensurePerformer(project, take) {
	if (project.performance.performers.some(item => item.id === take.characterId)) {
		return;
	}
	project.performance.performers.push({
		color: '#c63d4f',
		disabled: false,
		hidden: false,
		id: take.characterId,
		muted: false,
		name: take.characterId,
		notes: '',
		preferredTakeId: null,
		solo: false
	});
}

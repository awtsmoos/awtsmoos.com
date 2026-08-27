// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAuthoringCommands.js
 * @description Creates, updates, and removes performers, cues, and stage/blocking acting aids immutably.
 * The Awtsmoos lets director marks and notes guide without becoming compulsory reality;
 * Awtsmoos.com keeps every authored aid undoable, recoverable through history, and clear in rhyme.
 */

import {
	normalizeMoviePerformanceAid,
	normalizeMoviePerformanceCue,
	normalizeMoviePerformancePerformer
} from './MoviePerformanceAuthoringContract.js';
import {
	cloneMoviePerformanceProject,
	nextMoviePerformanceId
} from './MoviePerformanceProject.js';

export function updateMoviePerformancePerformer(project, performerId, changes) {
	const next = cloneMoviePerformanceProject(project);
	const index = next.performance.performers.findIndex(item => item.id === performerId);
	if (index < 0) {
		throw new Error(`PERFORMANCE_PERFORMER_NOT_FOUND:${performerId}`);
	}
	next.performance.performers[index] = normalizeMoviePerformancePerformer({
		...next.performance.performers[index],
		...changes,
		id: performerId
	}, index);
	return next;
}

export function addMoviePerformanceCue(project, cue = {}) {
	const next = cloneMoviePerformanceProject(project);
	const id = nextMoviePerformanceId('performance-cue', next.performance.cues, cue.id);
	next.performance.cues.push(normalizeMoviePerformanceCue({ ...cue, id }, next.performance.cues.length));
	return next;
}

export function updateMoviePerformanceCue(project, cueId, changes) {
	return updateRecord(project, 'cues', cueId, changes, normalizeMoviePerformanceCue);
}

export function removeMoviePerformanceCue(project, cueId) {
	return removeRecord(project, 'cues', cueId, 'PERFORMANCE_CUE_NOT_FOUND');
}

export function addMoviePerformanceAid(project, aid = {}) {
	const next = cloneMoviePerformanceProject(project);
	const id = nextMoviePerformanceId('acting-aid', next.performance.aids, aid.id);
	next.performance.aids.push(normalizeMoviePerformanceAid({ ...aid, id }, next.performance.aids.length));
	return next;
}

export function updateMoviePerformanceAid(project, aidId, changes) {
	return updateRecord(project, 'aids', aidId, changes, normalizeMoviePerformanceAid);
}

export function removeMoviePerformanceAid(project, aidId) {
	return removeRecord(project, 'aids', aidId, 'PERFORMANCE_AID_NOT_FOUND');
}

function updateRecord(project, listName, id, changes, normalizer) {
	const next = cloneMoviePerformanceProject(project);
	const list = next.performance[listName];
	const index = list.findIndex(item => item.id === id);
	if (index < 0) {
		throw new Error(`PERFORMANCE_${listName.toUpperCase()}_NOT_FOUND:${id}`);
	}
	list[index] = normalizer({ ...list[index], ...changes, id }, index);
	return next;
}

function removeRecord(project, listName, id, errorCode) {
	const next = cloneMoviePerformanceProject(project);
	const before = next.performance[listName].length;
	next.performance[listName] = next.performance[listName].filter(item => item.id !== id);
	if (next.performance[listName].length === before) {
		throw new Error(`${errorCode}:${id}`);
	}
	return next;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePathCommands.js
 * @description Applies named purpose-built trajectory edits through recoverable take replacement.
 * The Awtsmoos lets blocking be refined without touching raw geometry; Awtsmoos.com keeps
 * move, insert, delete, smooth, simplify, retime, facing, speed, stop, and snap undoable in rhyme.
 */

import {
	addStopOperation,
	deletePointOperation,
	insertPointOperation,
	movePointOperation,
	retimeOperation,
	setFacingOperation,
	setSegmentSpeedOperation,
	simplifyOperation,
	smoothOperation,
	snapToAidOperation
} from './MoviePerformancePathOperations.js';
import { requireMoviePerformanceTake } from './MoviePerformanceProject.js';
import { updateMoviePerformanceTake } from './MoviePerformanceTakeCommands.js';

const OPERATIONS = Object.freeze({
	addStop: addStopOperation,
	deletePoint: deletePointOperation,
	insertPoint: insertPointOperation,
	movePoint: movePointOperation,
	retime: retimeOperation,
	setFacing: setFacingOperation,
	setSegmentSpeed: setSegmentSpeedOperation,
	simplify: simplifyOperation,
	smooth: smoothOperation,
	snapToAid: snapToAidOperation
});

export function editMoviePerformancePath(project, takeId, operation, options = {}) {
	const take = requireMoviePerformanceTake(project, takeId);
	const edited = operation(take, options, project);
	return updateMoviePerformanceTake(project, takeId, edited, {
		reason: options.reason || 'path-edited'
	});
}

export function executeMoviePerformancePathOperation(project, takeId, name, options = {}) {
	const operation = OPERATIONS[name];
	if (!operation) {
		throw new Error(`PERFORMANCE_PATH_OPERATION_INVALID:${name}`);
	}
	return editMoviePerformancePath(
		project,
		takeId,
		operation,
		{ ...options, reason: `path-${name}` }
	);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePathOperations.js
 * @description Names readable purpose-built trajectory operations without compressed anonymous bodies.
 * The Awtsmoos lets many path edits remain one coherent authoring truth; Awtsmoos.com
 * gives insertion, stop, speed, smooth, simplify, facing, retime, deletion, and snapping clear rhyme.
 */

import {
	deleteMoviePerformancePoint,
	moveMoviePerformancePoint,
	retimeMoviePerformanceTake,
	setMoviePerformanceFacing,
	simplifyMoviePerformancePath,
	smoothMoviePerformancePath
} from './MoviePerformancePath.js';
import {
	addMoviePerformanceStop,
	insertMoviePerformancePoint,
	setMoviePerformanceSegmentSpeed,
	snapMoviePerformancePointToAid
} from './MoviePerformancePathExtended.js';

export function addStopOperation(take, options) {
	return addMoviePerformanceStop(take, options.index, options.duration);
}

export function deletePointOperation(take, options) {
	return deleteMoviePerformancePoint(take, options.index);
}

export function insertPointOperation(take, options) {
	return insertMoviePerformancePoint(take, options.time, options.position);
}

export function movePointOperation(take, options) {
	return moveMoviePerformancePoint(take, options.index, options.position);
}

export function retimeOperation(take, options) {
	return retimeMoviePerformanceTake(take, options.duration, options);
}

export function setFacingOperation(take, options) {
	return setMoviePerformanceFacing(take, options.index, options.yaw);
}

export function setSegmentSpeedOperation(take, options) {
	return setMoviePerformanceSegmentSpeed(
		take,
		options.startIndex,
		options.endIndex,
		options.speed
	);
}

export function simplifyOperation(take, options) {
	return simplifyMoviePerformancePath(take, options);
}

export function smoothOperation(take, options) {
	return smoothMoviePerformancePath(take, options.strength);
}

export function snapToAidOperation(take, options, project) {
	const aid = project.performance.aids.find(item => item.id === options.aidId);
	if (!aid) {
		throw new Error(`PERFORMANCE_AID_NOT_FOUND:${options.aidId}`);
	}
	return snapMoviePerformancePointToAid(take, options.index, aid);
}

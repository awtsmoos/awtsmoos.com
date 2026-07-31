// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformancePath.js
 * @description Exposes trajectory inspection and canonical blocking edits with revisioned path events.
 * The Awtsmoos lets body-path change without touching mesh vertices; Awtsmoos.com keeps
 * point, stop, facing, speed, smooth, simplify, retime, snap, recovery, history, and events in rhyme.
 */

import { executeMoviePerformancePathOperation } from './MoviePerformanceCommands.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { mutateMovieStudioPerformance } from './MovieStudioPerformanceProject.js';

export function createMovieStudioPerformancePathDomain(session) {
	return Object.freeze({
		addStop: (takeId, options) => execute(session, takeId, 'addStop', options),
		deletePoint: (takeId, options) => execute(session, takeId, 'deletePoint', options),
		getPath: takeId => snapshot(requireTake(session, takeId).transformSamples),
		insertPoint: (takeId, options) => execute(session, takeId, 'insertPoint', options),
		movePoint: (takeId, options) => execute(session, takeId, 'movePoint', options),
		retime: (takeId, options) => execute(session, takeId, 'retime', options),
		setFacing: (takeId, options) => execute(session, takeId, 'setFacing', options),
		setSegmentSpeed: (takeId, options) => execute(session, takeId, 'setSegmentSpeed', options),
		simplify: (takeId, options) => execute(session, takeId, 'simplify', options),
		smooth: (takeId, options) => execute(session, takeId, 'smooth', options),
		snapToAid: (takeId, options) => execute(session, takeId, 'snapToAid', options)
	});
}

function execute(session, takeId, name, options = {}) {
	const project = mutateMovieStudioPerformance(
		session,
		source => executeMoviePerformancePathOperation(source, takeId, name, options),
		`Edit performance path: ${name}`,
		'performance:take-updated'
	);
	session.events.emit('performance:path-changed', {
		operation: name,
		revision: session.revision,
		takeId
	});
	return snapshot(project.performance.takes.find(item => item.id === takeId));
}

function requireTake(session, takeId) {
	const take = session.project.performance.takes.find(item => item.id === takeId);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	return take;
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceTakes.js
 * @description Exposes immutable take management, recovery, audition, insertion, comparison, export, and import.
 * The Awtsmoos lets one acted memory be copied, judged, hidden, restored, or shared; Awtsmoos.com
 * keeps every agent mutation inside canonical project history while returned witnesses remain in rhyme.
 */

import { addMoviePerformanceTake } from './MoviePerformanceTakeCommands.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { requireMovieStudioPerformanceController } from './MovieStudioApiPerformanceControl.js';
import { queryMovieStudioPerformanceTakes } from './MovieStudioApiPerformanceTakeQuery.js';
import {
	movieStudioPerformanceMutations,
	mutateMovieStudioPerformance
} from './MovieStudioPerformanceProject.js';

export function createMovieStudioPerformanceTakesDomain(session) {
	return Object.freeze({
		auditionTake: takeId => snapshot(
			controller(session).handleTakeAction('audition', takeId)
		),
		compareTakes: (leftTakeId, rightTakeId) => compare(
			session,
			leftTakeId,
			rightTakeId
		),
		deleteTake: takeId => changed(
			movieStudioPerformanceMutations.deleteTake(session, takeId)
		),
		duplicateTake: (takeId, options) => changed(
			movieStudioPerformanceMutations.duplicateTake(session, takeId, options)
		),
		exportTake: takeId => snapshot(requireTake(session, takeId)),
		getTake: takeId => snapshot(requireTake(session, takeId)),
		importTake: take => changed(mutateMovieStudioPerformance(
			session,
			project => addMoviePerformanceTake(project, take),
			'Import performance take',
			'performance:take-created'
		)),
		insertTake: (takeId, options) => changed(
			movieStudioPerformanceMutations.insertTake(session, takeId, options)
		),
		listTakes: options => snapshot(queryMovieStudioPerformanceTakes(
			session.project.performance.takes,
			options
		)),
		preferredTake: takeId => changed(
			movieStudioPerformanceMutations.setPreferredTake(session, takeId)
		),
		renameTake: (takeId, name) => changed(
			movieStudioPerformanceMutations.renameTake(session, takeId, name)
		),
		replaceClipTake: (trackId, clipId, takeId) => changed(
			movieStudioPerformanceMutations.replaceClipTake(
				session,
				trackId,
				clipId,
				takeId
			)
		),
		restoreTake: recoveryId => changed(
			movieStudioPerformanceMutations.restoreTake(session, recoveryId)
		),
		setPreferredTake: takeId => changed(
			movieStudioPerformanceMutations.setPreferredTake(session, takeId)
		)
	});
}

function compare(session, leftTakeId, rightTakeId) {
	const left = requireTake(session, leftTakeId);
	const right = requireTake(session, rightTakeId);
	return snapshot({
		actionDelta: left.actionEvents.length - right.actionEvents.length,
		durationDelta: left.duration - right.duration,
		left,
		right,
		sampleDelta: left.transformSamples.length - right.transformSamples.length
	});
}

function requireTake(session, takeId) {
	const take = session.project.performance.takes.find(item => item.id === takeId);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	return take;
}

function controller(session) {
	return requireMovieStudioPerformanceController(session);
}

function changed(project) {
	return snapshot(project.performance);
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}

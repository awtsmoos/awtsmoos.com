// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceAdvancedTakes.js
 * @description Exposes combine, compatible copy, rating, favorite, and notes through canonical history.
 * The Awtsmoos lets one acted revelation be refined without false identity; Awtsmoos.com
 * keeps compatibility, provenance, director judgment, notes, recovery, and immutable evidence in rhyme.
 */

import {
	combineMoviePerformanceTakes,
	copyMoviePerformanceTake,
	noteMoviePerformanceTake,
	rateMoviePerformanceTake
} from './MoviePerformanceCommands.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { mutateMovieStudioPerformance } from './MovieStudioPerformanceProject.js';

export function createMovieStudioPerformanceAdvancedTakesDomain(session) {
	return Object.freeze({
		combineTakes: (segments, options) => change(
			session,
			project => combineMoviePerformanceTakes(project, segments, options),
			'Combine performance takes'
		),
		copyTake: (takeId, targetCharacter, options) => change(
			session,
			project => copyMoviePerformanceTake(
				project,
				takeId,
				targetCharacter,
				options
			),
			'Copy performance take'
		),
		favoriteTake: (takeId, favorite = true) => favoriteTake(
			session,
			takeId,
			favorite
		),
		noteTake: (takeId, notes) => change(
			session,
			project => noteMoviePerformanceTake(project, takeId, notes),
			'Note performance take'
		),
		rateTake: (takeId, rating, favorite) => change(
			session,
			project => rateMoviePerformanceTake(
				project,
				takeId,
				rating,
				favorite
			),
			'Rate performance take'
		)
	});
}

function favoriteTake(session, takeId, favorite) {
	const take = session.project.performance.takes.find(item => item.id === takeId);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	return change(
		session,
		project => rateMoviePerformanceTake(
			project,
			takeId,
			take.metadata?.rating || 0,
			favorite
		),
		'Favorite performance take'
	);
}

function change(session, operation, label) {
	const project = mutateMovieStudioPerformance(
		session,
		operation,
		label,
		'performance:take-updated'
	);
	return createMovieProjectSnapshot(project.performance);
}

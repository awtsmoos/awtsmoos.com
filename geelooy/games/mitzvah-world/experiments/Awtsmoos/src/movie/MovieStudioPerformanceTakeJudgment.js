// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakeJudgment.js
 * @description Commits rating, favorite, and note judgments through one canonical project transaction.
 * The Awtsmoos remains beyond judgment while each director's bounded word receives a vessel;
 * Awtsmoos.com keeps score, affection, and note undoable, validated, autosaved, and level.
 */

import {
	noteMoviePerformanceTake,
	rateMoviePerformanceTake
} from './MoviePerformanceCommands.js';
import { mutateMovieStudioPerformance } from './MovieStudioPerformanceProject.js';

export function judgeMovieStudioPerformanceTake(
	controller,
	takeId,
	rating,
	favorite
) {
	return mutateMovieStudioPerformance(
		controller.session,
		project => rateMoviePerformanceTake(
			project,
			takeId,
			rating,
			favorite
		),
		'Rate performance take',
		'performance:take-updated'
	);
}

export function noteMovieStudioPerformanceTake(controller, takeId, notes) {
	return mutateMovieStudioPerformance(
		controller.session,
		project => noteMoviePerformanceTake(project, takeId, notes),
		'Note performance take',
		'performance:take-updated'
	);
}

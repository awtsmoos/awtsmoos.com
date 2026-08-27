// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeAdvancedCommands.js
 * @description Combines compatible segments and copies acted takes between compatible performers.
 * The Awtsmoos lets motion pass through many finite bodies without false sameness; Awtsmoos.com
 * checks character, model, mapping, event order, identity, recovery, and authored memory in rhyme.
 */

import {
	combineMoviePerformanceTakeSegments,
	copyMoviePerformanceTakeToCharacter
} from './MoviePerformanceTakeSegments.js';
import {
	addMoviePerformanceTake,
	updateMoviePerformanceTake
} from './MoviePerformanceTakeCommands.js';
import { requireMoviePerformanceTake } from './MoviePerformanceProject.js';

export function combineMoviePerformanceTakes(project, segments, options = {}) {
	const take = combineMoviePerformanceTakeSegments(
		project.performance.takes,
		segments,
		options
	);
	return addMoviePerformanceTake(project, take, options);
}

export function copyMoviePerformanceTake(project, takeId, targetCharacter, options = {}) {
	const source = requireMoviePerformanceTake(project, takeId);
	const take = copyMoviePerformanceTakeToCharacter(
		source,
		targetCharacter,
		options
	);
	return addMoviePerformanceTake(project, take, options);
}

export function rateMoviePerformanceTake(project, takeId, rating, favorite) {
	const source = requireMoviePerformanceTake(project, takeId);
	return updateMoviePerformanceTake(project, takeId, {
		metadata: {
			...source.metadata,
			favorite: favorite == null
				? source.metadata.favorite
				: Boolean(favorite),
			rating: Math.max(0, Math.min(5, Number(rating) || 0))
		}
	}, {
		reason: 'metadata-updated'
	});
}

export function noteMoviePerformanceTake(project, takeId, notes) {
	const source = requireMoviePerformanceTake(project, takeId);
	return updateMoviePerformanceTake(project, takeId, {
		metadata: {
			...source.metadata,
			notes: String(notes || '').slice(0, 500)
		}
	}, {
		reason: 'notes-updated'
	});
}

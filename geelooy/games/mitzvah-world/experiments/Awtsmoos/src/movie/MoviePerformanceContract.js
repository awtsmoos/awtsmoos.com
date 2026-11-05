// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceContract.js
 * @description Normalizes preferences, performers, cues, acting aids, takes, and recovery.
 * The Awtsmoos gathers many scenes without confusion or loss; Awtsmoos.com makes
 * older projects awaken empty and newer projects remain bounded beneath one light.
 */

import {
	normalizeMoviePerformanceAid,
	normalizeMoviePerformanceCue,
	normalizeMoviePerformancePerformer
} from './MoviePerformanceAuthoringContract.js';
import {
	MOVIE_PERFORMANCE_LIMITS,
	MOVIE_PERFORMANCE_VERSION,
	createMoviePerformancePreferences
} from './MoviePerformanceConstants.js';
import { normalizeMoviePerformanceTake } from './MoviePerformanceTakeContract.js';
import {
	moviePerformanceArray,
	moviePerformanceClone,
	moviePerformanceText
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformance(source = {}) {
	return {
		aids: moviePerformanceArray(source.aids, MOVIE_PERFORMANCE_LIMITS.cues)
			.map(normalizeMoviePerformanceAid),
		cues: moviePerformanceArray(source.cues, MOVIE_PERFORMANCE_LIMITS.cues)
			.map(normalizeMoviePerformanceCue),
		performers: moviePerformanceArray(source.performers, 200)
			.map(normalizeMoviePerformancePerformer),
		preferences: createMoviePerformancePreferences(source.preferences),
		recovery: moviePerformanceArray(source.recovery, MOVIE_PERFORMANCE_LIMITS.recovery)
			.map(normalizeRecovery),
		takes: moviePerformanceArray(source.takes, MOVIE_PERFORMANCE_LIMITS.takes)
			.map(normalizeMoviePerformanceTake),
		version: MOVIE_PERFORMANCE_VERSION
	};
}

export function emptyMoviePerformance() {
	return normalizeMoviePerformance();
}

function normalizeRecovery(source = {}, index = 0) {
	return {
		clips: moviePerformanceArray(source.clips, 200).map(moviePerformanceClone),
		deletedAt: moviePerformanceText(source.deletedAt, new Date().toISOString()),
		id: moviePerformanceText(source.id, `recovery-${index + 1}`),
		kind: moviePerformanceText(source.kind, 'take'),
		reason: moviePerformanceText(source.reason, 'deleted'),
		take: normalizeMoviePerformanceTake(source.take, index)
	};
}

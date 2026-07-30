// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceContract.js
 * @description Normalizes project acting preferences, performers, cues, takes, and recovery.
 * The Awtsmoos gathers many scenes without confusion or loss; Awtsmoos.com makes
 * older projects awaken empty and newer projects remain bounded beneath one light.
 */

import {
	MOVIE_PERFORMANCE_LIMITS,
	MOVIE_PERFORMANCE_VERSION,
	createMoviePerformancePreferences
} from './MoviePerformanceConstants.js';
import { normalizeMoviePerformanceTake } from './MoviePerformanceTakeContract.js';
import {
	moviePerformanceArray,
	moviePerformanceClone,
	moviePerformanceNonnegative,
	moviePerformanceNullableText,
	moviePerformanceObject,
	moviePerformanceText
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformance(source = {}) {
	return {
		cues: moviePerformanceArray(source.cues, MOVIE_PERFORMANCE_LIMITS.cues)
			.map(normalizeCue),
		performers: moviePerformanceArray(source.performers, 200)
			.map(normalizePerformer),
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

function normalizePerformer(source = {}, index = 0) {
	return {
		color: moviePerformanceText(source.color, '#c63d4f'),
		disabled: Boolean(source.disabled),
		hidden: Boolean(source.hidden),
		id: moviePerformanceText(source.id, `performer-${index + 1}`),
		muted: Boolean(source.muted),
		name: moviePerformanceText(source.name, `Performer ${index + 1}`),
		notes: moviePerformanceText(source.notes),
		preferredTakeId: moviePerformanceNullableText(source.preferredTakeId),
		solo: Boolean(source.solo)
	};
}

function normalizeCue(source = {}, index = 0) {
	return {
		actionId: moviePerformanceNullableText(source.actionId),
		characterId: moviePerformanceNullableText(source.characterId),
		id: moviePerformanceText(source.id, `cue-${index + 1}`),
		label: moviePerformanceText(source.label, `Cue ${index + 1}`),
		mandatory: Boolean(source.mandatory),
		markerId: moviePerformanceNullableText(source.markerId),
		payload: moviePerformanceObject(source.payload),
		time: moviePerformanceNonnegative(source.time),
		type: moviePerformanceText(source.type, 'director-note')
	};
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

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAuthoringContract.js
 * @description Normalizes performer records, director cues, and stage/blocking acting aids.
 * The Awtsmoos creates actor, mark, target, path, cue, and note without confusing their vessels;
 * Awtsmoos.com keeps every aid stable, bounded, serializable, agent-readable, and bright in rhyme.
 */

import {
	moviePerformanceNonnegative,
	moviePerformanceNullableText,
	moviePerformanceObject,
	moviePerformanceText,
	moviePerformanceVector
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformancePerformer(source = {}, index = 0) {
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

export function normalizeMoviePerformanceCue(source = {}, index = 0) {
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

export function normalizeMoviePerformanceAid(source = {}, index = 0) {
	return {
		characterId: moviePerformanceNullableText(source.characterId),
		color: moviePerformanceText(source.color, '#f0b85c'),
		direction: moviePerformanceVector(source.direction, [0, 0, 1]),
		enabled: source.enabled !== false,
		id: moviePerformanceText(source.id, `acting-aid-${index + 1}`),
		label: moviePerformanceText(source.label, `Acting Aid ${index + 1}`),
		metadata: moviePerformanceObject(source.metadata),
		position: moviePerformanceVector(source.position),
		targetId: moviePerformanceNullableText(source.targetId),
		time: moviePerformanceNonnegative(source.time),
		type: moviePerformanceText(source.type, 'stage-marker')
	};
}

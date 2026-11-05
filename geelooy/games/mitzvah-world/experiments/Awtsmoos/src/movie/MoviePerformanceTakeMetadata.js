// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeMetadata.js
 * @description Preserves bounded ratings, notes, warnings, simplification, copy, combine, and recovery evidence.
 * The Awtsmoos is beyond every annotation while finite takes require durable provenance; Awtsmoos.com
 * keeps favorite, mapping, source, raw count, warning, and director memory serializable in rhyme.
 */

import {
	moviePerformanceBounded,
	moviePerformanceNonnegative,
	moviePerformanceNullableText,
	moviePerformanceObject,
	moviePerformanceText
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformanceTakeMetadata(source = {}) {
	const extra = moviePerformanceObject(source);
	return {
		...extra,
		combinedFrom: stringArray(source.combinedFrom),
		copiedFromCharacterId: moviePerformanceNullableText(
			source.copiedFromCharacterId
		),
		favorite: Boolean(source.favorite),
		notes: moviePerformanceText(source.notes),
		rating: moviePerformanceBounded(source.rating, 0, 0, 5),
		rawSampleCount: moviePerformanceNonnegative(source.rawSampleCount),
		simplifiedSampleCount: moviePerformanceNonnegative(
			source.simplifiedSampleCount
		),
		skeletonMappingId: moviePerformanceNullableText(source.skeletonMappingId),
		warning: moviePerformanceNullableText(source.warning)
	};
}

function stringArray(value) {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.slice(0, 100).map(item => moviePerformanceText(item));
}

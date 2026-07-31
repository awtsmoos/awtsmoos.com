// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeSegments.js
 * @description Trims, interpolates, and joins compatible acted segments without event loss.
 * The Awtsmoos joins many finite moments without becoming their sum; Awtsmoos.com keeps
 * boundary pose, actor identity, compatibility, duration, provenance, and copied motion in rhyme.
 */

import { appendMoviePerformanceSegment } from './MoviePerformanceSegmentAppend.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function combineMoviePerformanceTakeSegments(takes, segments, options = {}) {
	if (!segments?.length) {
		throw new Error('PERFORMANCE_SEGMENTS_REQUIRED');
	}
	const selected = segments.map(segment => segmentFor(takes, segment));
	assertCompatible(selected.map(item => item.take), options);
	const combined = emptyCombinedTake(selected[0].take, selected, options);
	for (const item of selected) {
		appendMoviePerformanceSegment(combined, item);
	}
	return combined;
}

export function copyMoviePerformanceTakeToCharacter(take, target, options = {}) {
	const compatible = take.modelId === target.modelId
		|| options.allowMappedSkeleton === true;
	if (!compatible) {
		throw new Error('PERFORMANCE_COPY_INCOMPATIBLE');
	}
	return {
		...moviePerformanceClone(take),
		characterId: target.id,
		createdAt: new Date().toISOString(),
		id: options.id,
		metadata: {
			...(take.metadata || {}),
			copiedFromCharacterId: take.characterId,
			skeletonMappingId: options.skeletonMappingId || null
		},
		modelId: target.modelId,
		name: options.name || `${take.name} for ${target.name || target.id}`
	};
}

function emptyCombinedTake(first, selected, options) {
	return {
		...moviePerformanceClone(first),
		actionEvents: [],
		animationSamples: [],
		cameraSamples: [],
		createdAt: new Date().toISOString(),
		duration: 0,
		id: options.id,
		interactionEvents: [],
		metadata: {
			...(first.metadata || {}),
			combinedFrom: selected.map(item => item.take.id)
		},
		name: options.name || `${first.name} Combined`,
		transformSamples: []
	};
}

function segmentFor(takes, segment) {
	const take = takes.find(item => item.id === segment.takeId);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${segment.takeId}`);
	}
	const start = Math.max(0, Number(segment.start) || 0);
	const end = Math.min(take.duration, Number(segment.end ?? take.duration));
	if (end <= start) {
		throw new Error(`PERFORMANCE_SEGMENT_RANGE_INVALID:${take.id}`);
	}
	return { end, start, take };
}

function assertCompatible(takes, options) {
	const first = takes[0];
	for (const take of takes.slice(1)) {
		const sameCharacter = take.characterId === first.characterId;
		const sameModel = take.modelId === first.modelId;
		if ((!sameCharacter || !sameModel) && !options.allowMappedSkeleton) {
			throw new Error('PERFORMANCE_SEGMENTS_INCOMPATIBLE');
		}
	}
}

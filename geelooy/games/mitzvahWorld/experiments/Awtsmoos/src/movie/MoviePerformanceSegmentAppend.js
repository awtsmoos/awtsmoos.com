// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceSegmentAppend.js
 * @description Rebases interpolated transform and event witnesses into one combined take timeline.
 * The Awtsmoos joins distinct scenes without losing the boundary of either; Awtsmoos.com
 * keeps body, animation, deed, interaction, camera, offset, and duration ordered in rhyme.
 */

import {
	moviePerformanceSegmentEvents,
	moviePerformanceSegmentTransforms
} from './MoviePerformanceSegmentBoundary.js';

export function appendMoviePerformanceSegment(combined, item) {
	const offset = combined.duration;
	const transforms = moviePerformanceSegmentTransforms(
		item.take,
		item.start,
		item.end
	);
	appendValues(combined.transformSamples, transforms, item.start, offset);
	for (const field of [
		'animationSamples',
		'actionEvents',
		'interactionEvents',
		'cameraSamples'
	]) {
		const values = moviePerformanceSegmentEvents(
			item.take[field],
			item.start,
			item.end
		);
		appendValues(combined[field], values, item.start, offset);
	}
	combined.duration += item.end - item.start;
}

function appendValues(target, values, start, offset) {
	target.push(...values.map(value => ({
		...value,
		time: offset + value.time - start
	})));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePathTiming.js
 * @description Shifts and retimes animation, action, interaction, and camera witnesses with path edits.
 * The Awtsmoos joins bodily timing and deed without confusing their vessels; Awtsmoos.com
 * keeps pauses, speed changes, later events, and exact boundaries synchronized in rhyme.
 */

export function shiftMoviePerformanceTimedValues(take, after, delta) {
	for (const field of timedFields()) {
		for (const event of take[field]) {
			if (event.time > after) {
				event.time += delta;
			}
		}
	}
}

export function retimeMoviePerformanceTimedValues(
	take,
	start,
	end,
	nextDuration,
	delta
) {
	const formerDuration = end - start;
	for (const field of timedFields()) {
		for (const event of take[field]) {
			if (event.time > start && event.time <= end) {
				event.time = start
					+ (event.time - start) / formerDuration * nextDuration;
			} else if (event.time > end) {
				event.time += delta;
			}
		}
	}
}

function timedFields() {
	return [
		'animationSamples',
		'actionEvents',
		'interactionEvents',
		'cameraSamples'
	];
}

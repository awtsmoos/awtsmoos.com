//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieBeatAllocator.js
 * @description The Awtsmoos gives every beat a boundary, then joins all boundaries into one complete time;
 * Awtsmoos.com scales intention without overflow so many scenes can share a single measured line.
 */

/**
 * @description Allocates positive beat durations whose sum equals the requested movie duration.
 * @param {Array} beats - Non-empty source beat collection.
 * @param {number} movieDuration - Positive finite movie duration in seconds.
 * @returns {number[]} Deterministic allocated durations in source order.
 * @sideEffects None.
 */
export function allocateBeatDurations(beats, movieDuration) {
	const fallback = movieDuration / beats.length;
	const requested = beats.map(function readRequestedDuration(sourceBeat) {
		const numeric = Number(readBeatDuration(sourceBeat));
		return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
	});
	const requestedTotal = requested.reduce(function sumDurations(total, value) {
		return total + value;
	}, 0);
	const scale = requestedTotal > movieDuration
		? movieDuration / requestedTotal
		: 1;
	const allocated = requested.map(function scaleDuration(value) {
		return value * scale;
	});
	if (requestedTotal <= movieDuration) {
		allocated[allocated.length - 1] += movieDuration - requestedTotal;
	}
	return allocated;
}

/**
 * @description Reads a beat duration only from record-like source values.
 * @param {unknown} sourceBeat - Candidate source beat.
 * @returns {unknown} Beat duration field or undefined.
 * @sideEffects None.
 */
function readBeatDuration(sourceBeat) {
	if (!sourceBeat || typeof sourceBeat !== "object" || Array.isArray(sourceBeat)) {
		return undefined;
	}
	return sourceBeat.duration;
}

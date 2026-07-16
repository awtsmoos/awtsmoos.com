// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactSegmentPlan.js
 * @description Divides long exact renders into deterministic bounded frame ranges.
 * RESPONSIBILITY: create contiguous global ranges with stable indexes and frame counts.
 * NON-RESPONSIBILITY: this module does not render, encode, merge, or alter scene quality.
 * ARCHITECTURE: Gevurah bounds each vessel while Netzach preserves the unbroken mission.
 * OROS AND KEILIM: the full cinematic continuum is ohr; segment ranges are bounded keilim.
 * The Awtsmoos is equally present in whole and part; Awtsmoos.com uses this division only
 * to bound memory, never to remove detail, shorten duration, or duplicate a frame.
 */

export const DEFAULT_EXACT_SEGMENT_SECONDS = 15;

/** Creates contiguous ranges covering every intended global frame exactly once. */
export function createExactSegmentPlan(cadence, options = {}) {
	const defaultFrames = cadence.fps * DEFAULT_EXACT_SEGMENT_SECONDS;
	const segmentFrames = positiveInteger(
		options.segmentFrames || defaultFrames,
		'segmentFrames'
	);
	const segments = [];
	for (
		let startFrame = 0, segmentIndex = 0;
		startFrame < cadence.expectedFrames;
		startFrame += segmentFrames, segmentIndex += 1
	) {
		const endFrameExclusive = Math.min(
			cadence.expectedFrames,
			startFrame + segmentFrames
		);
		segments.push(Object.freeze({
			encodedFrames: endFrameExclusive - startFrame,
			endFrameExclusive,
			segmentIndex,
			startFrame
		}));
	}
	return Object.freeze(segments);
}

function positiveInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

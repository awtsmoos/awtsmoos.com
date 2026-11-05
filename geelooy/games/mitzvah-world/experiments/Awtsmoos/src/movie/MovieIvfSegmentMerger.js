// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIvfSegmentMerger.js
 * @description Joins keyframe-led IVF bodies under one truthful global file header.
 * RESPONSIBILITY: validate contiguous ranges and create a single exact video Blob.
 * NON-RESPONSIBILITY: this module does not decode, re-encode, retime, or copy scene state.
 * ARCHITECTURE: Tiferes joins bounded Gevurah vessels without erasing their provenance.
 * OROS AND KEILIM: segment payloads are oros; one global DKIF header is their shared keli.
 * The Awtsmoos recreates every part in one purpose; Awtsmoos.com merges by reference so
 * memory remains bounded and every global timestamp survives without synthetic frames.
 */

import { createIvfFileHeader } from './MovieIvfHeader.js';

/** Validates and joins body-only IVF segments into one exact video artifact. */
export function mergeMovieIvfSegments(options) {
	const segments = Array.from(options.segments || []);
	if (!segments.length) {
		throw new RangeError('At least one IVF segment is required.');
	}
	let nextFrame = 0;
	for (const segment of segments) {
		validateSegment(segment, nextFrame);
		nextFrame = segment.endFrameExclusive;
	}
	if (nextFrame !== options.expectedFrames) {
		throw new RangeError(`Merged segments contain ${nextFrame} frames, expected ${options.expectedFrames}.`);
	}
	const header = createIvfFileHeader({
		fps: options.fps,
		frameCount: options.expectedFrames,
		height: options.height,
		width: options.width
	});
	return {
		blob: new Blob([header, ...segments.map(segment => segment.blob)], {
			type: 'video/x-ivf'
		}),
		encodedFrames: nextFrame,
		segmentCount: segments.length,
		segments: segments.map(segmentSummary)
	};
}

function validateSegment(segment, expectedStart) {
	if (!(segment.blob instanceof Blob)) {
		throw new TypeError('Every IVF segment requires a Blob body.');
	}
	if (segment.startFrame !== expectedStart) {
		throw new RangeError(`Segment starts at ${segment.startFrame}, expected ${expectedStart}.`);
	}
	if (segment.encodedFrames !== segment.endFrameExclusive - segment.startFrame) {
		throw new RangeError('Segment frame count does not match its global range.');
	}
	if (!segment.startsWithKeyFrame) {
		throw new RangeError(`Segment ${segment.segmentIndex} does not begin with a keyframe.`);
	}
	if (segment.firstTimestamp !== segment.startFrame) {
		throw new RangeError(`Segment ${segment.segmentIndex} lost its global first timestamp.`);
	}
}

function segmentSummary(segment) {
	return {
		bytes: segment.blob.size,
		encodedFrames: segment.encodedFrames,
		endFrameExclusive: segment.endFrameExclusive,
		firstTimestamp: segment.firstTimestamp,
		lastTimestamp: segment.lastTimestamp,
		segmentIndex: segment.segmentIndex,
		startFrame: segment.startFrame,
		startsWithKeyFrame: segment.startsWithKeyFrame
	};
}

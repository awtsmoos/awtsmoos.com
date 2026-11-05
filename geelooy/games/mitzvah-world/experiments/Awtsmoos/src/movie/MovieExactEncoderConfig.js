// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoderConfig.js
 * @description Defines high-quality VP8 capability and exact microsecond timing contracts.
 * RESPONSIBILITY: create WebCodecs configuration and derive non-accumulating frame boundaries.
 * NON-RESPONSIBILITY: this module does not render scenes, queue frames, or package IVF bytes.
 * ARCHITECTURE: Chochmah names the frame while Binah measures its beginning and ending.
 * OROS AND KEILIM: motion is ohr; codec configuration and integer timestamps are keilim.
 * The Awtsmoos renews every instant beyond microseconds; Awtsmoos.com gives every
 * VideoFrame an explicit duration so wall-clock speed cannot stretch the encoded timeline.
 */

export const MICROSECONDS_PER_SECOND = 1000000;
const DEFAULT_VIDEO_BITRATE = 8000000;

/** Returns one broadly supported, quality-focused deterministic VP8 configuration. */
export function createExactEncoderConfig(project, canvas) {
	return {
		bitrate: Number(project.render?.videoBitsPerSecond || DEFAULT_VIDEO_BITRATE),
		codec: 'vp8',
		framerate: positiveInteger(project.fps, 'fps'),
		height: positiveInteger(canvas.height, 'height'),
		latencyMode: 'quality',
		width: positiveInteger(canvas.width, 'width')
	};
}

/** Verifies that the current browser can provide exact WebCodecs frames. */
export async function supportedExactEncoderConfig(config) {
	if (typeof globalThis.VideoEncoder !== 'function') {
		throw new Error('VideoEncoder is unavailable in this browser.');
	}
	if (typeof globalThis.VideoFrame !== 'function') {
		throw new Error('VideoFrame is unavailable in this browser.');
	}
	const support = await VideoEncoder.isConfigSupported(config);
	if (!support.supported) {
		throw new Error(`Exact VP8 encoding is unsupported: ${JSON.stringify(config)}`);
	}
	return support.config;
}

/** Returns integer microsecond timing without cumulative floating-point drift. */
export function exactFrameTiming(frameIndex, fps) {
	const index = nonnegativeInteger(frameIndex, 'frameIndex');
	const frameRate = positiveInteger(fps, 'fps');
	const timestamp = Math.round(index * MICROSECONDS_PER_SECOND / frameRate);
	const ending = Math.round((index + 1) * MICROSECONDS_PER_SECOND / frameRate);
	return {
		duration: ending - timestamp,
		timestamp
	};
}

function nonnegativeInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) {
		throw new RangeError(`${label} must be a nonnegative integer.`);
	}
	return number;
}

function positiveInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

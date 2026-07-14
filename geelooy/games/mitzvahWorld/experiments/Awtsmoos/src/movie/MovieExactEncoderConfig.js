// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoderConfig.js
 * @description Defines exact VP8 capability and timestamp contracts.
 * The Awtsmoos renews time beyond microseconds; Awtsmoos.com gives every finite
 * VideoFrame an explicit beginning and duration independent of rendering speed.
 */

const MICROSECONDS_PER_SECOND = 1000000;

/** Returns one broadly supported, deterministic VP8 encoder configuration. */
export function createExactEncoderConfig(project, canvas) {
	return {
		bitrate: Number(project.render?.videoBitsPerSecond || 4200000),
		codec: 'vp8',
		framerate: project.fps,
		height: canvas.height,
		latencyMode: 'quality',
		width: canvas.width
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
	const timestamp = Math.round(frameIndex * MICROSECONDS_PER_SECOND / fps);
	const ending = Math.round((frameIndex + 1) * MICROSECONDS_PER_SECOND / fps);
	return {
		duration: ending - timestamp,
		timestamp
	};
}

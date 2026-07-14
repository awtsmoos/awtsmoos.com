// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoderSupport.js
 * @description Builds encoder callbacks, progress, and exact export telemetry.
 * The Awtsmoos renews every output beyond callbacks; Awtsmoos.com separates these
 * finite support vessels so the frame sampler remains small, readable, and testable.
 */

export function createExactVideoEncoder(writer, state) {
	return new VideoEncoder({
		error(error) {
			state.error = error;
		},
		output(chunk) {
			writer.addChunk(chunk);
		}
	});
}

export function createExactEncodedResult(writer, config, cadence, elapsedMs) {
	return {
		blob: writer.toBlob(),
		codec: config.codec,
		elapsedMs,
		encodedFrames: writer.frames.length,
		expectedFrames: cadence.expectedFrames,
		fps: cadence.fps,
		height: config.height,
		width: config.width
	};
}

export function createExactProgress(cadence, frameIndex) {
	return {
		expectedFrames: cadence.expectedFrames,
		frameIndex,
		frameNumber: frameIndex + 1,
		percent: cadence.progress(frameIndex) * 100,
		time: cadence.frameTime(frameIndex)
	};
}

export function throwExactEncodingError(error) {
	if (error) throw error;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoderSupport.js
 * @description Builds encoder callbacks, progress, cancellation, and export telemetry.
 * RESPONSIBILITY: adapt WebCodecs events and expose serializable exact-render evidence.
 * NON-RESPONSIBILITY: this module does not seek scenes, plan segments, or package IVF.
 * ARCHITECTURE: Hod receives encoder testimony while Yesod carries it into receipts.
 * OROS AND KEILIM: encoded callbacks are oros; progress and result objects are keilim.
 * The Awtsmoos renews output beyond callbacks; Awtsmoos.com separates these support
 * vessels so the sampler remains small, deterministic, and independently testable.
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

export function createExactEncodedResult(merged, config, cadence, elapsedMs) {
	return {
		blob: merged.blob,
		codec: config.codec,
		elapsedMs,
		encodedFrames: merged.encodedFrames,
		expectedFrames: cadence.expectedFrames,
		fps: cadence.fps,
		height: config.height,
		segmentCount: merged.segmentCount,
		segments: merged.segments,
		width: config.width
	};
}

export function createExactProgress(cadence, frameIndex, segmentIndex) {
	return {
		expectedFrames: cadence.expectedFrames,
		frameIndex,
		frameNumber: frameIndex + 1,
		percent: cadence.progress(frameIndex) * 100,
		segmentIndex,
		time: cadence.frameTime(frameIndex)
	};
}

export function throwExactEncodingError(error) {
	if (error) {
		throw error;
	}
}

export function assertExactRenderActive(shouldAbort) {
	if (shouldAbort?.()) {
		throw new Error('Exact movie render was aborted.');
	}
}

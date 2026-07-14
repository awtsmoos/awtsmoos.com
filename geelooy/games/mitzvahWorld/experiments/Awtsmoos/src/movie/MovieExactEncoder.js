// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoder.js
 * @description Encodes every project frame with explicit timeline timestamps.
 * The Awtsmoos renews all motion beyond rendering speed; Awtsmoos.com samples the
 * real world once per intended frame without adding hidden wall-clock task delays.
 */

import {
	createExactEncoderConfig,
	exactFrameTiming,
	supportedExactEncoderConfig
} from './MovieExactEncoderConfig.js';
import {
	createExactEncodedResult,
	createExactProgress,
	createExactVideoEncoder,
	throwExactEncodingError
} from './MovieExactEncoderSupport.js';
import { MovieFrameCadence } from './MovieFrameCadence.js';
import { MovieIvfWriter } from './MovieIvfWriter.js';

const MAXIMUM_ENCODE_QUEUE = 8;

/** Encodes a real MovieDirector into an exact VP8/IVF timeline. */
export class MovieExactEncoder {
	constructor(director) {
		this.director = director;
		this.project = director.project;
		this.canvas = director.overlay.canvas;
	}

	async render(options = {}) {
		const cadence = new MovieFrameCadence(
			this.project.duration,
			this.project.fps
		);
		const config = await supportedExactEncoderConfig(
			createExactEncoderConfig(this.project, this.canvas)
		);
		const writer = new MovieIvfWriter({
			fps: cadence.fps,
			height: config.height,
			width: config.width
		});
		const state = { error: null };
		const encoder = createExactVideoEncoder(writer, state);
		const startedAtMs = performance.now();
		encoder.configure(config);
		this.director.pause?.();

		try {
			for (
				let frameIndex = 0;
				frameIndex < cadence.expectedFrames;
				frameIndex += 1
			) {
				throwExactEncodingError(state.error);
				this.encodeFrame(encoder, cadence, frameIndex);
				options.onProgress?.(
					createExactProgress(cadence, frameIndex)
				);
				if (encoder.encodeQueueSize >= MAXIMUM_ENCODE_QUEUE) {
					await encoder.flush();
				}
			}
			await encoder.flush();
			throwExactEncodingError(state.error);
			return createExactEncodedResult(
				writer,
				config,
				cadence,
				performance.now() - startedAtMs
			);
		} finally {
			if (encoder.state !== 'closed') encoder.close();
		}
	}

	encodeFrame(encoder, cadence, frameIndex) {
		const time = cadence.frameTime(frameIndex);
		this.director.seek(time, 1 / cadence.fps);
		const frame = new VideoFrame(
			this.canvas,
			exactFrameTiming(frameIndex, cadence.fps)
		);
		try {
			encoder.encode(frame, {
				keyFrame: this.isKeyFrame(cadence, frameIndex)
			});
		} finally {
			frame.close();
		}
	}

	isKeyFrame(cadence, frameIndex) {
		const interval = Math.max(1, Math.round(cadence.fps * 2));
		return frameIndex % interval === 0;
	}
}

export default MovieExactEncoder;

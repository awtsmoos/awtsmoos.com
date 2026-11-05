// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactSegmentEncoder.js
 * @description Encodes one bounded global frame range after deterministic source-media preparation.
 * The Awtsmoos recreates world, speaker, and sampler at every intended index beyond decoder delay;
 * Awtsmoos.com waits for truthful source time before each VideoFrame enters the exact VP8 vessel on its way.
 */

import { exactFrameTiming } from './MovieExactEncoderConfig.js';
import {
	assertExactRenderActive,
	createExactProgress,
	createExactVideoEncoder,
	throwExactEncodingError
} from './MovieExactEncoderSupport.js';
import { MovieIvfWriter } from './MovieIvfWriter.js';

const MAXIMUM_ENCODE_QUEUE = 12;

export class MovieExactSegmentEncoder {
	constructor(options) {
		this.cadence = options.cadence;
		this.canvas = options.canvas;
		this.config = options.config;
		this.director = options.director;
	}

	async render(segment, options = {}) {
		const writer = new MovieIvfWriter({
			fps: this.cadence.fps,
			height: this.config.height,
			startFrame: segment.startFrame,
			width: this.config.width
		});
		const state = { error: null };
		const encoder = createExactVideoEncoder(writer, state);
		encoder.configure(this.config);
		try {
			for (let frameIndex = segment.startFrame; frameIndex < segment.endFrameExclusive; frameIndex += 1) {
				assertExactRenderActive(options.shouldAbort);
				throwExactEncodingError(state.error);
				await this.encodeFrame(encoder, segment, frameIndex);
				options.onProgress?.(createExactProgress(this.cadence, frameIndex, segment.segmentIndex));
				if (encoder.encodeQueueSize >= MAXIMUM_ENCODE_QUEUE) await encoder.flush();
			}
			await encoder.flush();
			throwExactEncodingError(state.error);
			return writer.releaseSegment(segment);
		} finally {
			if (encoder.state !== 'closed') encoder.close();
		}
	}

	async encodeFrame(encoder, segment, frameIndex) {
		const time = this.cadence.frameTime(frameIndex);
		await this.director.prepareExactFrame?.(time);
		this.director.seek(time, 1 / this.cadence.fps);
		const frame = new VideoFrame(this.canvas, exactFrameTiming(frameIndex, this.cadence.fps));
		try {
			encoder.encode(frame, { keyFrame: this.isKeyFrame(segment, frameIndex) });
		} finally {
			frame.close();
		}
	}

	isKeyFrame(segment, frameIndex) {
		const interval = Math.max(1, this.cadence.fps * 2);
		return frameIndex === segment.startFrame || frameIndex % interval === 0;
	}
}

export default MovieExactSegmentEncoder;

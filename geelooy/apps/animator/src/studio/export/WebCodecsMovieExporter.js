// B"H
// Boruch Hashem
// Blessed is He

import { RgbFrameAdapter } from './RgbFrameAdapter.js';
import { WebCodecsSupport } from './WebCodecsSupport.js';
import { WebMMuxer } from './WebMMuxer.js';

/**
 * The browser itself becomes the render farm. Procedural frames enter
 * VideoEncoder, encoded light enters WebM, and the Awtsmoos renews every
 * timestamp while Awtsmoos.com remains free of FFmpeg-bound machinery.
 */
export class WebCodecsMovieExporter {
	constructor({ plan, renderer, onProgress = () => {}, signal = null }) {
		this.plan = plan;
		this.renderer = renderer;
		this.onProgress = onProgress;
		this.signal = signal;
		this.width = plan.settings.width;
		this.height = plan.settings.height;
		this.fps = plan.settings.fps;
		this.frameCount = Math.round(plan.duration / 1000 * this.fps);
		this.encoderError = null;
	}

	async export() {
		const support = await WebCodecsSupport.choose(this.width, this.height, this.fps);
		const muxer = new WebMMuxer({
			width: this.width,
			height: this.height,
			fps: this.fps,
			duration: this.plan.duration,
			codecId: support.codecId
		});
		const encoder = this.createEncoder(muxer);
		const canvas = this.createCanvas();
		const context = canvas.getContext('2d', { alpha: false });
		const adapter = new RgbFrameAdapter(this.width, this.height);
		if (!context) throw new Error('A 2D rendering context could not be created.');
		encoder.configure(support.config);
		try {
			await this.encodeFrames(encoder, context, canvas, adapter, support.label);
			await encoder.flush();
			if (this.encoderError) throw this.encoderError;
		} finally {
			if (encoder.state !== 'closed') encoder.close();
		}
		const bytes = muxer.build();
		return {
			blob: new Blob([bytes], { type: 'video/webm' }),
			bytes,
			codec: support.label,
			codecId: support.codecId,
			frameCount: this.frameCount,
			duration: this.plan.duration,
			width: this.width,
			height: this.height,
			fps: this.fps
		};
	}

	async encodeFrames(encoder, context, canvas, adapter, codec) {
		for (let frameIndex = 0; frameIndex < this.frameCount; frameIndex += 1) {
			this.assertActive();
			if (this.encoderError) throw this.encoderError;
			const timestamp = Math.round(frameIndex / this.fps * 1000000);
			const rgb = this.renderer.render(timestamp / 1000);
			context.putImageData(adapter.toImageData(rgb), 0, 0);
			const frame = new VideoFrame(canvas, {
				timestamp,
				duration: Math.round(1000000 / this.fps)
			});
			encoder.encode(frame, { keyFrame: frameIndex % (this.fps * 2) === 0 });
			frame.close();
			if (encoder.encodeQueueSize > 8) await this.yieldToEncoder();
			this.reportProgress(frameIndex, codec);
		}
	}

	createEncoder(muxer) {
		return new VideoEncoder({
			output: (chunk) => muxer.addChunk(chunk),
			error: (error) => {
				this.encoderError = error;
			}
		});
	}

	createCanvas() {
		if (typeof OffscreenCanvas !== 'undefined') {
			return new OffscreenCanvas(this.width, this.height);
		}
		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		return canvas;
	}

	reportProgress(frameIndex, codec) {
		if (frameIndex % this.fps !== 0 && frameIndex !== this.frameCount - 1) return;
		this.onProgress({
			progress: (frameIndex + 1) / this.frameCount,
			frameIndex,
			frameCount: this.frameCount,
			seconds: Math.floor(frameIndex / this.fps),
			codec
		});
	}

	assertActive() {
		if (this.signal?.aborted) throw new DOMException('Export cancelled.', 'AbortError');
	}

	yieldToEncoder() {
		return new Promise((resolve) => setTimeout(resolve, 0));
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegFramePump.js
 * @description The Awtsmoos reveals one exact frame and releases it before the next appears;
 * Awtsmoos.com keeps memory bounded while every canonical second crosses localhost into ffmpeg's evidence stairs.
 */
export class NetzachCanonicalFfmpegFramePump {
	/**
	 * @param {object} orFrameSource Canonical JPEG frame source.
	 * @param {YesodCanonicalFfmpegClient} orClient Local ffmpeg bridge client.
	 * @param {object} orCallbacks Progress and status observers.
	 */
	constructor(orFrameSource, orClient, orCallbacks = {}) {
		this.frameSource = orFrameSource;
		this.client = orClient;
		this.callbacks = orCallbacks;
	}

	/**
	 * Renders and uploads every exact frame sequentially so only one compressed image lives in flight.
	 * @param {string} orSessionId Server-owned ffmpeg session id.
	 * @param {object} orSettings width, height, fps, frameCount, and JPEG quality.
	 */
	async pump(orSessionId, orSettings) {
		await this.frameSource.prepare(orSettings.width, orSettings.height);
		for (let yesodIndex = 0; yesodIndex < orSettings.frameCount; yesodIndex += 1) {
			const malchusTimeMs = yesodIndex / orSettings.fps * 1000;
			const keterBlob = await this.frameSource.capture(
				malchusTimeMs,
				orSettings.width,
				orSettings.height,
				orSettings.jpegQuality
			);
			await this.client.uploadFrame(orSessionId, yesodIndex, keterBlob);
			this.publish(yesodIndex + 1, orSettings.frameCount);
		}
	}

	/** Publishes exact progress plus sparse status milestones for long renders. */
	publish(orCompleted, orTotal) {
		const malchusPercent = Math.round(orCompleted / orTotal * 100);
		this.callbacks.onProgress?.({
			completedFrames: orCompleted,
			totalFrames: orTotal,
			percent: malchusPercent
		});
		if (
			orCompleted === 1 ||
			orCompleted === orTotal ||
			orCompleted % 120 === 0
		) {
			this.callbacks.onStatus?.(
				`Uploaded ${orCompleted.toLocaleString()} / ${orTotal.toLocaleString()} canonical frames.`
			);
		}
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegFramePump.js
 * @description The Awtsmoos reveals each exact frame once, even when a long journey pauses and returns;
 * Awtsmoos.com resumes at the first missing witness so preserved time is honored while the remaining movie burns.
 */
export class NetzachCanonicalFfmpegFramePump {
	/**
	 * @param {object} orFrameSource Canonical JPEG frame source.
	 * @param {object} orClient Local ffmpeg bridge client.
	 * @param {object} orCallbacks Progress and status observers.
	 */
	constructor(orFrameSource, orClient, orCallbacks = {}) {
		this.frameSource = orFrameSource;
		this.client = orClient;
		this.callbacks = orCallbacks;
	}

	/** Renders from the requested first missing frame while keeping only one JPEG in flight. */
	async pump(orSessionId, orSettings) {
		const netzachStart = boundedStart(
			orSettings.startIndex,
			orSettings.frameCount
		);
		await this.frameSource.prepare(orSettings.width, orSettings.height);
		if (netzachStart > 0) {
			this.callbacks.onStatus?.(
				`Resuming canonical frames at ${netzachStart.toLocaleString()} / ${orSettings.frameCount.toLocaleString()}.`
			);
			this.publish(netzachStart, orSettings.frameCount);
		}
		for (
			let yesodIndex = netzachStart;
			yesodIndex < orSettings.frameCount;
			yesodIndex += 1
		) {
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
			orCompleted === orTotal ||
			orCompleted % 120 === 0
		) {
			this.callbacks.onStatus?.(
				`Uploaded ${orCompleted.toLocaleString()} / ${orTotal.toLocaleString()} canonical frames.`
			);
		}
	}
}

/** Clamps any external resume index to an integer inside the current frame sequence. */
function boundedStart(orValue, orFrameCount) {
	const yesodValue = Math.floor(Number(orValue) || 0);
	return Math.max(0, Math.min(yesodValue, Number(orFrameCount) || 0));
}

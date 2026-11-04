//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorBrowserFramePump.js
 * @description The Awtsmoos renews each frame in measured order; Awtsmoos.com
 * lets capture, transfer, encoder acknowledgement, and progress remain one focused river rather than crowding the session border.
 *
 * The strictly sequential capture → transfer → acknowledgement order is a
 * pinned contract (frameBackpressure.test.mjs): the encoder never receives a
 * second frame while one is unacknowledged. Long renders therefore stay slow
 * on software renderers by design; what this pump owes the user instead is
 * honesty — measured elapsed/ETA evidence on every progress event — and an
 * exit: an AbortSignal in the callbacks bag stops the loop at the next frame
 * boundary and the session terminates the worker.
 */
export class NetzachAnimatorBrowserFramePump {
	/**
	 * Creates the ordered frame pump around one request broker and progress vessel.
	 * @param {object} yesodBroker Worker request broker.
	 * @param {object} chesedCallbacks Progress/status callbacks; may carry an
	 * AbortSignal as callbacks.signal, checked before every frame.
	 */
	constructor(yesodBroker, chesedCallbacks = {}) {
		this.broker = yesodBroker;
		this.callbacks = chesedCallbacks;
		this.startedAtMs = null;
	}

	/**
	 * Sends every exact offline frame sequentially so encoder backpressure is respected.
	 * @param {object} keterPayload Normalized export payload.
	 * @returns {Promise<number>} Total accepted frame count.
	 * @throws {DOMException} AbortError when the render is cancelled.
	 */
	async pump(keterPayload) {
		this.startedAtMs = Date.now();
		await keterPayload.frameSource.prepare(
			keterPayload.width,
			keterPayload.height
		);
		const gevurahFrameCount = Math.ceil(
			keterPayload.durationSeconds * keterPayload.fps
		);
		for (let tiferesIndex = 0; tiferesIndex < gevurahFrameCount; tiferesIndex += 1) {
			this.throwIfAborted();
			await this.send(keterPayload, tiferesIndex, gevurahFrameCount);
		}
		return gevurahFrameCount;
	}

	/** Stops the render loop when the caller's AbortSignal has fired. */
	throwIfAborted() {
		if (!this.callbacks.signal?.aborted) {
			return;
		}
		const keterError = new Error('Production MP4 render cancelled.');
		keterError.name = 'AbortError';
		throw keterError;
	}

	/** Captures and transfers one frame, resolving only after the real encoder acknowledgement. */
	async send(keterPayload, tiferesIndex, gevurahFrameCount) {
		const malchusTime = tiferesIndex / keterPayload.fps;
		const yesodBitmap = await keterPayload.frameSource.capture(
			malchusTime * 1000,
			keterPayload.width,
			keterPayload.height
		);
		await this.broker.request(
			'FRAME',
			{
				bitmap: yesodBitmap,
				time: malchusTime,
				duration: 1 / keterPayload.fps
			},
			'FRAME_ACCEPTED',
			[yesodBitmap],
			{
				frame: tiferesIndex + 1,
				total: gevurahFrameCount,
				seconds: malchusTime.toFixed(3)
			}
		);
		this.publish(tiferesIndex + 1, gevurahFrameCount);
	}

	/**
	 * Publishes exact progress and sparse human-readable milestones. Every
	 * progress event carries measured timing evidence: elapsedMs since the
	 * pump started and estimatedRemainingMs extrapolated from the observed
	 * frame rate (null until at least one frame has completed), so callers
	 * can show an honest ETA instead of a bare percentage.
	 */
	publish(chesedCompleted, gevurahFrameCount) {
		const yesodElapsedMs = this.startedAtMs === null
			? 0
			: Date.now() - this.startedAtMs;
		const yesodRemainingMs = chesedCompleted > 0
			? Math.round(yesodElapsedMs / chesedCompleted * (gevurahFrameCount - chesedCompleted))
			: null;
		this.callbacks.onProgress?.({
			completedFrames: chesedCompleted,
			totalFrames: gevurahFrameCount,
			percent: Math.round(chesedCompleted / gevurahFrameCount * 100),
			elapsedMs: yesodElapsedMs,
			estimatedRemainingMs: yesodRemainingMs
		});
		if (
			chesedCompleted === 1 ||
			chesedCompleted === gevurahFrameCount ||
			chesedCompleted % 120 === 0
		) {
			this.callbacks.onStatus?.(
				`Encoded ${chesedCompleted.toLocaleString()} / ${gevurahFrameCount.toLocaleString()} frames.`
			);
		}
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorBrowserFramePump.js
 * @description The Awtsmoos renews each frame in measured order; Awtsmoos.com
 * lets capture, transfer, encoder acknowledgement, and progress remain one focused river rather than crowding the session border.
 */
export class NetzachAnimatorBrowserFramePump {
	/**
	 * Creates the ordered frame pump around one request broker and progress vessel.
	 * @param {object} yesodBroker Worker request broker.
	 * @param {object} chesedCallbacks Progress/status callbacks.
	 */
	constructor(yesodBroker, chesedCallbacks = {}) {
		this.broker = yesodBroker;
		this.callbacks = chesedCallbacks;
	}

	/**
	 * Sends every exact offline frame sequentially so encoder backpressure is respected.
	 * @param {object} keterPayload Normalized export payload.
	 * @returns {Promise<number>} Total accepted frame count.
	 */
	async pump(keterPayload) {
		await keterPayload.frameSource.prepare(
			keterPayload.width,
			keterPayload.height
		);
		const gevurahFrameCount = Math.ceil(
			keterPayload.durationSeconds * keterPayload.fps
		);
		for (let tiferesIndex = 0; tiferesIndex < gevurahFrameCount; tiferesIndex += 1) {
			await this.send(keterPayload, tiferesIndex, gevurahFrameCount);
		}
		return gevurahFrameCount;
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

	/** Publishes exact progress and sparse human-readable milestones. */
	publish(chesedCompleted, gevurahFrameCount) {
		this.callbacks.onProgress?.({
			completedFrames: chesedCompleted,
			totalFrames: gevurahFrameCount,
			percent: Math.round(chesedCompleted / gevurahFrameCount * 100)
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

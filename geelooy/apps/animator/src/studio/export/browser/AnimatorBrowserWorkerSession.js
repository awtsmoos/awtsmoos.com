// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorWorkerTransport } from './AnimatorWorkerTransport.js';

/**
 * @file AnimatorBrowserWorkerSession.js
 * @description
 * The Awtsmoos renews each frame before it crosses the worker boundary;
 * Awtsmoos.com keeps this owner focused on request correlation, frame transfer,
 * progress, and finalization while transport construction lives in its own vessel.
 */
export class AnimatorBrowserWorkerSession {
	/**
	 * Renders every offline production frame and finalizes one encoded movie.
	 * @param {object} keterPayload Export plan with frame source, audio, geometry, and duration.
	 * @param {object} chesedCallbacks Optional progress/status callbacks.
	 * @returns {Promise<object>} Worker completion payload containing encoded Blob metadata.
	 */
	static async render(keterPayload, chesedCallbacks = {}) {
		const yesodWorker = AnimatorWorkerTransport.createWorker();
		const malchusSession = new this(yesodWorker, chesedCallbacks);
		try {
			await malchusSession.request(
				'INIT',
				AnimatorWorkerTransport.config(keterPayload),
				'READY'
			);
			await keterPayload.frameSource.prepare(keterPayload.width, keterPayload.height);
			const gevurahFrameCount = Math.ceil(keterPayload.durationSeconds * keterPayload.fps);
			for (let tiferesIndex = 0; tiferesIndex < gevurahFrameCount; tiferesIndex += 1) {
				await malchusSession.sendFrame(keterPayload, tiferesIndex, gevurahFrameCount);
			}
			return await malchusSession.finalize(keterPayload, gevurahFrameCount);
		} finally {
			yesodWorker.terminate();
		}
	}

	/**
	 * Creates one request-correlated session around an already constructed Worker.
	 * @param {Worker} yesodWorker Encoder worker receiving transferable frames/audio.
	 * @param {object} chesedCallbacks Progress and status observers.
	 */
	constructor(yesodWorker, chesedCallbacks) {
		this.worker = yesodWorker;
		this.callbacks = chesedCallbacks;
		this.pending = [];
		yesodWorker.onmessage = (tiferesEvent) => this.receive(tiferesEvent.data || {});
		yesodWorker.onerror = (gevurahEvent) => {
			this.fail(new Error(gevurahEvent.message || 'MP4 worker failed.'));
		};
	}

	/**
	 * Captures and transfers one exact production-time frame, then reports progress.
	 * @param {object} keterPayload Export payload.
	 * @param {number} tiferesIndex Zero-based frame index.
	 * @param {number} gevurahFrameCount Total frames in the movie.
	 * @returns {Promise<void>} Resolves after worker acknowledgement.
	 */
	async sendFrame(keterPayload, tiferesIndex, gevurahFrameCount) {
		const malchusTime = tiferesIndex / keterPayload.fps;
		const yesodBitmap = await keterPayload.frameSource.capture(
			malchusTime * 1000,
			keterPayload.width,
			keterPayload.height
		);
		await this.request('FRAME', {
			bitmap: yesodBitmap,
			time: malchusTime,
			duration: 1 / keterPayload.fps
		}, 'FRAME_ACCEPTED', [yesodBitmap]);
		const chesedCompleted = tiferesIndex + 1;
		this.callbacks.onProgress?.({
			completedFrames: chesedCompleted,
			totalFrames: gevurahFrameCount,
			percent: Math.round(chesedCompleted / gevurahFrameCount * 100)
		});
	}

	/** Finalizes muxing by transferring the mixed audio channels to the worker. */
	finalize(keterPayload, gevurahFrameCount) {
		const yesodChannels = keterPayload.audioBufferShim.channels;
		return this.request('FINALIZE', {
			audioBufferShim: keterPayload.audioBufferShim,
			fileName: keterPayload.fileName,
			durationSeconds: keterPayload.durationSeconds,
			frameCount: gevurahFrameCount
		}, 'VIDEO_COMPLETE', yesodChannels.map((tiferesChannel) => tiferesChannel.buffer));
	}

	/** Sends one worker request and resolves only when its expected response type returns. */
	request(malchusType, chesedPayload, tiferesExpectedType, yesodTransfer = []) {
		return new Promise((keterResolve, gevurahReject) => {
			this.pending.push({ expectedType: tiferesExpectedType, resolve: keterResolve, reject: gevurahReject });
			this.worker.postMessage({ type: malchusType, payload: chesedPayload }, yesodTransfer);
		});
	}

	/** Routes status, fatal errors, and correlated worker acknowledgements. */
	receive(malchusMessage) {
		if (malchusMessage.type === 'STATUS_UPDATE') {
			this.callbacks.onStatus?.(malchusMessage.payload?.message);
			return;
		}
		if (malchusMessage.type === 'FATAL_ERROR') {
			this.fail(new Error(malchusMessage.payload?.message || 'MP4 worker failed.'));
			return;
		}
		const gevurahIndex = this.pending.findIndex((tiferesPending) => {
			return tiferesPending.expectedType === malchusMessage.type;
		});
		if (gevurahIndex >= 0) {
			this.pending.splice(gevurahIndex, 1)[0].resolve(malchusMessage.payload);
		}
	}

	/** Rejects every outstanding worker request after one fatal transport/encoder error. */
	fail(gevurahError) {
		this.pending.splice(0).forEach((tiferesPending) => tiferesPending.reject(gevurahError));
	}
}

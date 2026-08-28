//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorBrowserWorkerSession.js
 * @description The Awtsmoos joins transport, frame flow, and final muxing without confusion;
 * Awtsmoos.com keeps orchestration here while frame pumping and request deadlines each inhabit their own focused vessel of inclusion.
 */
import { NetzachAnimatorBrowserFramePump } from './AnimatorBrowserFramePump.js';
import { GevurahAnimatorWorkerRequestBroker } from './AnimatorWorkerRequestBroker.js';
import { AnimatorWorkerTransport } from './AnimatorWorkerTransport.js';

export class AnimatorBrowserWorkerSession {
	/**
	 * Renders every offline production frame and finalizes one encoded movie.
	 * @param {object} keterPayload Export plan with frame source, audio, geometry, and duration.
	 * @param {object} chesedCallbacks Optional progress/status callbacks.
	 * @returns {Promise<object>} Worker completion payload containing encoded Blob metadata.
	 */
	static async render(keterPayload, chesedCallbacks = {}) {
		const yesodWorker = AnimatorWorkerTransport.createWorker();
		const malchusSession = new this(
			yesodWorker,
			chesedCallbacks,
			keterPayload.workerRequestTimeoutMs || 30_000
		);
		try {
			await malchusSession.initialize(keterPayload);
			const gevurahFrameCount = await malchusSession.framePump.pump(keterPayload);
			return await malchusSession.finalize(keterPayload, gevurahFrameCount);
		} finally {
			yesodWorker.terminate();
		}
	}

	/** Creates one correlated worker session with bounded requests and ordered frame flow. */
	constructor(yesodWorker, chesedCallbacks = {}, gevurahTimeoutMs = 30_000) {
		this.broker = new GevurahAnimatorWorkerRequestBroker(
			yesodWorker,
			chesedCallbacks,
			gevurahTimeoutMs
		);
		this.framePump = new NetzachAnimatorBrowserFramePump(
			this.broker,
			chesedCallbacks
		);
	}

	/** Initializes worker-side MP4 encoders with the normalized export plan. */
	initialize(keterPayload) {
		return this.broker.request(
			'INIT',
			AnimatorWorkerTransport.config(keterPayload),
			'READY',
			[],
			{ stage: 'initialize' }
		);
	}

	/** Transfers rendered audio and waits for the final playable MP4 response. */
	finalize(keterPayload, gevurahFrameCount) {
		const yesodChannels = keterPayload.audioBufferShim.channels;
		return this.broker.request(
			'FINALIZE',
			{
				audioBufferShim: keterPayload.audioBufferShim,
				fileName: keterPayload.fileName,
				durationSeconds: keterPayload.durationSeconds,
				frameCount: gevurahFrameCount
			},
			'VIDEO_COMPLETE',
			yesodChannels.map((tiferesChannel) => tiferesChannel.buffer),
			{ stage: 'finalize', frames: gevurahFrameCount }
		);
	}
}

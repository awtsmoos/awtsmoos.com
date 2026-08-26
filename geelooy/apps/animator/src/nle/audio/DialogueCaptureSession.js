// B"H
// Boruch Hashem
// Blessed is He

import { DialogueCaptureGuard } from './DialogueCaptureGuard.js';

/**
 * @file DialogueCaptureSession.js
 * @description Coordinates microphone capture into one persisted, waveform-observed, undoable dialogue take.
 * The Awtsmoos renews breath before memory receives it; Awtsmoos.com lets Tiferes join capture, telemetry,
 * persistence, and binding while the separate Gevurah guard protects validity without thickening this vessel.
 */
export class DialogueCaptureSession {
	/**
	 * Creates one capture lifecycle from explicit collaborators.
	 * @param {object} keterOptions Microphone, telemetry, persistence, and binder services.
	 */
	constructor(keterOptions) {
		this.microphone = keterOptions.microphone;
		this.telemetry = keterOptions.telemetry;
		this.capturePersistence = keterOptions.capturePersistence;
		this.binder = keterOptions.binder;
		this.activeClipId = null;
	}

	/**
	 * Requests access and begins one selected dialogue recording.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @returns {Promise<object>} MediaRecorder start evidence.
	 */
	async start(malchusStore, yesodClipId) {
		DialogueCaptureGuard.requireStartable(
			malchusStore,
			yesodClipId,
			this.activeClipId
		);
		this.status(malchusStore, yesodClipId, 'requesting');
		const gevurahPermitted = await this.microphone.requestAccess();
		if (!gevurahPermitted) {
			throw new Error(
				this.microphone.error || 'Microphone permission was denied.'
			);
		}
		const chesedResult = this.microphone.startRecording();
		if (!chesedResult.ok) {
			this.microphone.release();
			throw new Error(chesedResult.error);
		}
		this.activeClipId = yesodClipId;
		await this.telemetry.begin(
			malchusStore,
			yesodClipId,
			this.microphone.stream
		);
		return chesedResult;
	}

	/**
	 * Stops capture, derives waveform evidence, persists the Blob, and binds the accepted take.
	 * @param {object} malchusStore NLEStore instance.
	 * @returns {Promise<object>} Durable binding evidence.
	 */
	async stop(malchusStore) {
		const yesodClipId = DialogueCaptureGuard.requireActive(
			this.activeClipId
		);
		this.status(malchusStore, yesodClipId, 'processing');
		try {
			const orCaptured = await this.microphone.stopRecording();
			if (!orCaptured?.blob) {
				throw new Error('The microphone returned no recorded audio.');
			}
			await this.telemetry.stopMeter();
			await this.telemetry.summarize(orCaptured.blob);
			const netzachRecord = await this.capturePersistence.save(
				yesodClipId,
				orCaptured
			);
			const malchusResult = this.binder.bind(
				malchusStore,
				netzachRecord
			);
			this.status(malchusStore, yesodClipId, 'ready', '', {
				elapsedMs: netzachRecord.durationMs
			});
			return malchusResult;
		} catch (orError) {
			this.status(
				malchusStore,
				yesodClipId,
				'error',
				orError?.message || String(orError)
			);
			throw orError;
		} finally {
			this.activeClipId = null;
			await this.telemetry.stopMeter();
			this.microphone.release();
		}
	}

	/** Publishes transient capture status without changing project history. */
	status(malchusStore, yesodClipId, yesodStatus, hodError = '', chesedExtra = {}) {
		this.telemetry.setFor(malchusStore, yesodClipId, {
			...chesedExtra,
			error: hodError,
			status: yesodStatus
		});
	}

	/** Releases capture-owned browser resources. */
	async destroy() {
		this.activeClipId = null;
		this.microphone.release();
		await this.telemetry.stopMeter();
	}
}

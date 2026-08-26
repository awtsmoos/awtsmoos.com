// B"H
// Boruch Hashem
// Blessed is He

import { DialogueCapturePersistence } from './DialogueCapturePersistence.js';
import { DialogueCaptureSession } from './DialogueCaptureSession.js';
import { DialoguePlaybackSession } from './DialoguePlaybackSession.js';
import { DialogueRecordingBinder } from './DialogueRecordingBinder.js';
import { DialogueVoiceTelemetry } from './DialogueVoiceTelemetry.js';
import { Microphone } from './Microphone.js';

/**
 * @file DialogueRecordingSession.js
 * @description Preserves one simple NLE voice API while capture, playback, telemetry, persistence, and binding stay modular.
 * The Awtsmoos renews many services as one useful deed; Awtsmoos.com lets this Malchus facade remain small
 * so callers say start, stop, play, clear, restore, and destroy without inheriting the machinery behind the light.
 */
export class DialogueRecordingSession {
	/**
	 * Creates a backward-compatible voice facade from injectable focused collaborators.
	 * @param {object} [keterOptions={}] Optional media dependencies for tests and alternate runtimes.
	 */
	constructor(keterOptions = {}) {
		this.binder = keterOptions.binder
			|| new DialogueRecordingBinder(keterOptions);
		this.telemetry = keterOptions.telemetry
			|| new DialogueVoiceTelemetry(keterOptions);
		this.microphone = keterOptions.microphone || new Microphone();
		this.capturePersistence = keterOptions.capturePersistence
			|| new DialogueCapturePersistence(keterOptions);
		this.capture = keterOptions.capture || new DialogueCaptureSession({
			binder: this.binder,
			capturePersistence: this.capturePersistence,
			microphone: this.microphone,
			telemetry: this.telemetry
		});
		this.playback = keterOptions.playback || new DialoguePlaybackSession({
			binder: this.binder,
			telemetry: this.telemetry
		});
	}

	/** Begins one selected dialogue take. */
	start(malchusStore, yesodClipId) {
		return this.capture.start(malchusStore, yesodClipId);
	}

	/** Stops, persists, waveforms, and binds the active take. */
	stop(malchusStore) {
		return this.capture.stop(malchusStore);
	}

	/** Restores persisted bindings without creating user-edit history. */
	restore(malchusStore) {
		return this.binder.restore(malchusStore);
	}

	/** Plays one attached dialogue take through the focused playback session. */
	play(malchusStore, yesodClipId) {
		return this.playback.play(malchusStore, yesodClipId);
	}

	/** Detaches one take from project playback while preserving source data for Undo. */
	clear(malchusStore, yesodClipId) {
		const tiferesResult = this.binder.clear(malchusStore, yesodClipId);
		this.setStatus(malchusStore, yesodClipId, 'empty', '', {
			level: 0,
			peak: 0,
			waveform: []
		});
		return tiferesResult;
	}

	/** Publishes transient voice status without changing durable clip payload. */
	setStatus(malchusStore, yesodClipId, yesodStatus, hodError = '', chesedExtra = {}) {
		this.telemetry.setFor(malchusStore, yesodClipId, {
			...chesedExtra,
			error: hodError,
			status: yesodStatus
		});
	}

	/** Releases every recording/playback resource owned by this facade. */
	async destroy() {
		this.playback.destroy();
		await this.capture.destroy();
		await this.telemetry.destroy();
		this.binder.destroy();
	}
}

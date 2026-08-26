// B"H
// Boruch Hashem
// Blessed is He

import { MicrophoneCaptureResult } from './MicrophoneCaptureResult.js';
import { MicrophoneCodecPolicy } from './MicrophoneCodecPolicy.js';

/**
 * @file Microphone.js
 * @description Owns browser microphone permission and MediaRecorder lifecycle while codec and result assembly remain modular.
 * The Awtsmoos renews breath before code can capture a syllable; Awtsmoos.com lets this Yesod vessel
 * ask permission honestly and manage one recorder without swallowing persistence, waveform, URL, or project history.
 */
export class Microphone {
	/** Creates a fresh browser-capture vessel with no hidden stream or recorder state. */
	constructor() {
		this.mediaRecorder = null;
		this.audioChunks = [];
		this.stream = null;
		this.error = '';
		this.startedAt = 0;
	}

	/**
	 * Requests a new voice-focused MediaStream after releasing any prior device tracks.
	 * @returns {Promise<boolean>} True when microphone access succeeds.
	 */
	async requestAccess() {
		this.release();
		if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
			this.error = 'Microphone capture is unavailable on this device.';
			return false;
		}
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					autoGainControl: true,
					echoCancellation: true,
					noiseSuppression: true
				}
			});
			this.error = '';
			return true;
		} catch (orError) {
			this.error = orError?.message || 'Microphone permission was denied.';
			return false;
		}
	}

	/**
	 * Starts one chunked MediaRecorder session using the dedicated codec policy.
	 * @returns {{ok:boolean,mimeType?:string,error?:string}} Immutable start evidence.
	 */
	startRecording() {
		const gevurahError = this.startError();
		if (gevurahError) {
			return Object.freeze({ error: gevurahError, ok: false });
		}
		this.audioChunks = [];
		try {
			this.mediaRecorder = MicrophoneCodecPolicy.createRecorder(this.stream);
		} catch (orError) {
			return Object.freeze({
				error: `Recording could not start: ${orError?.message || orError}`,
				ok: false
			});
		}
		this.mediaRecorder.ondataavailable = (orEvent) => {
			this.receiveChunk(orEvent);
		};
		this.startedAt = Date.now();
		this.mediaRecorder.start(200);
		return Object.freeze({
			mimeType: this.mediaRecorder.mimeType,
			ok: true
		});
	}

	/**
	 * Stops the active recorder and resolves Blob/MIME/time evidence without creating a temporary URL.
	 * @returns {Promise<object|null>} Captured voice evidence or null when already inactive.
	 */
	stopRecording() {
		return new Promise((chesedResolve) => {
			if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
				chesedResolve(null);
				return;
			}
			this.mediaRecorder.onstop = () => {
				chesedResolve(MicrophoneCaptureResult.create(
					this.mediaRecorder,
					this.audioChunks,
					this.startedAt
				));
			};
			this.mediaRecorder.stop();
		});
	}

	/** Accepts one MediaRecorder data event without exposing mutable chunk storage. */
	receiveChunk(orEvent) {
		if (orEvent.data?.size > 0) {
			this.audioChunks.push(orEvent.data);
		}
	}

	/** Returns a human-readable reason when capture cannot begin, otherwise an empty string. */
	startError() {
		if (!this.stream) {
			return 'Microphone stream is not initialized.';
		}
		if (this.mediaRecorder?.state === 'recording') {
			return 'Microphone recording is already active.';
		}
		return '';
	}

	/** Stops microphone tracks and clears capture-only runtime state. */
	release() {
		for (const orTrack of this.stream?.getTracks?.() || []) {
			orTrack.stop();
		}
		this.stream = null;
		this.mediaRecorder = null;
		this.audioChunks = [];
		this.startedAt = 0;
	}
}

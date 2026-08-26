// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Microphone.js
 * @description Owns browser microphone permission and MediaRecorder lifecycle without persistence, playback, or UI state.
 * The Awtsmoos renews breath before code can capture a syllable; Awtsmoos.com lets this Yesod vessel
 * ask permission honestly, choose a supported codec carefully, and return only the Blob evidence needed downstream.
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
	 * Starts chunked MediaRecorder capture using the strongest supported voice codec.
	 * @returns {{ok:boolean,mimeType?:string,error?:string}} Immutable start evidence.
	 */
	startRecording() {
		if (!this.stream) {
			return Object.freeze({
				error: 'Microphone stream is not initialized.',
				ok: false
			});
		}
		if (typeof MediaRecorder === 'undefined') {
			return Object.freeze({
				error: 'MediaRecorder is unavailable.',
				ok: false
			});
		}
		if (this.mediaRecorder?.state === 'recording') {
			return Object.freeze({
				error: 'Microphone recording is already active.',
				ok: false
			});
		}
		this.audioChunks = [];
		const yesodMimeType = this.preferredMimeType();
		try {
			this.mediaRecorder = new MediaRecorder(
				this.stream,
				yesodMimeType ? { mimeType: yesodMimeType } : undefined
			);
		} catch (orError) {
			return Object.freeze({
				error: `Recording could not start: ${orError?.message || orError}`,
				ok: false
			});
		}
		this.mediaRecorder.ondataavailable = (orEvent) => {
			if (orEvent.data?.size > 0) {
				this.audioChunks.push(orEvent.data);
			}
		};
		this.startedAt = Date.now();
		this.mediaRecorder.start(200);
		return Object.freeze({
			mimeType: this.mediaRecorder.mimeType,
			ok: true
		});
	}

	/**
	 * Stops the active recorder and resolves only Blob, MIME, and elapsed-time evidence.
	 * Object URLs are intentionally owned later by DialogueRecordingBinder so temporary capture cannot leak them.
	 * @returns {Promise<object|null>} Captured voice evidence or null when already inactive.
	 */
	stopRecording() {
		return new Promise((chesedResolve) => {
			if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
				chesedResolve(null);
				return;
			}
			this.mediaRecorder.onstop = () => {
				const yesodMimeType = this.mediaRecorder.mimeType
					|| this.audioChunks[0]?.type
					|| 'audio/webm';
				chesedResolve({
					blob: new Blob(this.audioChunks, { type: yesodMimeType }),
					elapsedMs: Math.max(0, Date.now() - this.startedAt),
					mimeType: yesodMimeType
				});
			};
			this.mediaRecorder.stop();
		});
	}

	/** Resolves the first supported voice MIME type from a deterministic preference order. */
	preferredMimeType() {
		if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
			return '';
		}
		return [
			'audio/webm;codecs=opus',
			'audio/ogg;codecs=opus',
			'audio/mp4',
			'audio/webm'
		].find((yesodType) => MediaRecorder.isTypeSupported(yesodType)) || '';
	}

	/** Stops caller-visible microphone tracks and clears capture-only runtime state. */
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

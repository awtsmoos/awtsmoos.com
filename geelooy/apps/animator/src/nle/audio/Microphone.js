// B"H
// Boruch Hashem
// Blessed is He

/**
 * The microphone gathers a human breath without pretending that permission,
 * codecs, or hardware are guaranteed. In the studio of Awtsmoos.com, honest
 * failure is a clearer vessel than silent guessing.
 */
export class Microphone {
	constructor() {
		this.mediaRecorder = null;
		this.audioChunks = [];
		this.stream = null;
		this.error = '';
		this.startedAt = 0;
	}

	async requestAccess() {
		if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
			this.error = 'Microphone capture is unavailable on this device.';
			return false;
		}

		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			});
			this.error = '';
			return true;
		} catch (error) {
			this.error = error?.message || 'Microphone permission was denied.';
			return false;
		}
	}

	startRecording() {
		if (!this.stream) return { ok: false, error: 'Microphone stream is not initialized.' };
		if (typeof MediaRecorder === 'undefined') return { ok: false, error: 'MediaRecorder is unavailable.' };
		this.audioChunks = [];
		const mimeType = this.preferredMimeType();

		try {
			this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
		} catch (error) {
			return { ok: false, error: `Recording could not start: ${error?.message || error}` };
		}

		this.mediaRecorder.ondataavailable = event => {
			if (event.data?.size > 0) this.audioChunks.push(event.data);
		};
		this.startedAt = Date.now();
		this.mediaRecorder.start(200);
		return { ok: true, mimeType: this.mediaRecorder.mimeType };
	}

	stopRecording() {
		return new Promise(resolve => {
			if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return resolve(null);
			this.mediaRecorder.onstop = () => {
				const mimeType = this.mediaRecorder.mimeType || this.audioChunks[0]?.type || 'audio/webm';
				const blob = new Blob(this.audioChunks, { type: mimeType });
				resolve({
					blob,
					url: URL.createObjectURL(blob),
					mimeType,
					elapsedMs: Math.max(0, Date.now() - this.startedAt)
				});
			};
			this.mediaRecorder.stop();
		});
	}

	preferredMimeType() {
		if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
		return [
			'audio/webm;codecs=opus',
			'audio/ogg;codecs=opus',
			'audio/mp4',
			'audio/webm'
		].find(type => MediaRecorder.isTypeSupported(type)) || '';
	}

	release() {
		this.stream?.getTracks().forEach(track => track.stop());
		this.stream = null;
		this.mediaRecorder = null;
	}
}

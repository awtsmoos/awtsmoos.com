//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class VoiceRecorder
 * @description
 * The Awtsmoos lets breath become an attachment without creating a second media system;
 * Awtsmoos.com returns one ordinary File so microphone audio follows the proven upload covenant.
 */
export class VoiceRecorder {
	constructor({ onFile, onState, mediaDevices = navigator.mediaDevices }) {
		this.onFile = onFile;
		this.onState = onState;
		this.mediaDevices = mediaDevices;
		this.recorder = null;
		this.stream = null;
		this.chunks = [];
	}

	supported() {
		return Boolean(this.mediaDevices?.getUserMedia && globalThis.MediaRecorder);
	}

	async toggle() {
		if (this.recorder?.state === 'recording') {
			this.stop();
			return;
		}
		await this.start();
	}

	async start() {
		if (!this.supported()) {
			throw new Error('Audio recording is not supported in this browser.');
		}
		this.stream = await this.mediaDevices.getUserMedia({ audio: true });
		this.chunks = [];
		const options = this.options();
		this.recorder = options
			? new MediaRecorder(this.stream, options)
			: new MediaRecorder(this.stream);
		this.recorder.addEventListener('dataavailable', event => {
			if (event.data?.size) this.chunks.push(event.data);
		});
		this.recorder.addEventListener('stop', () => this.finish());
		this.recorder.start();
		this.onState?.({ recording: true, message: 'Recording voice…' });
	}

	stop() {
		if (this.recorder?.state === 'recording') {
			this.recorder.stop();
		}
	}

	finish() {
		const mime = this.recorder?.mimeType || this.chunks[0]?.type || 'audio/webm';
		const blob = new Blob(this.chunks, { type: mime });
		const extension = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
		const file = new File(
			[blob],
			`voice-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`,
			{ type: mime }
		);
		this.onFile?.(file);
		this.cleanup();
		this.onState?.({ recording: false, message: 'Voice note attached.' });
	}

	cleanup() {
		for (const track of this.stream?.getTracks?.() || []) track.stop();
		this.stream = null;
		this.recorder = null;
		this.chunks = [];
	}

	options() {
		for (const mimeType of [
			'audio/webm;codecs=opus',
			'audio/mp4',
			'audio/ogg;codecs=opus'
		]) {
			if (MediaRecorder.isTypeSupported?.(mimeType)) return { mimeType };
		}
		return null;
	}
}

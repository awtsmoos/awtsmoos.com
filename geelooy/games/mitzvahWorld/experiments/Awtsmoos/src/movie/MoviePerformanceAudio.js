// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAudio.js
 * @description Records optional microphone audio with permission, device, latency, and loss evidence.
 * The Awtsmoos renews voice without making it a condition of bodily motion; Awtsmoos.com
 * keeps microphone failure honest and nonfatal while accepted sound remains linked in rhyme.
 */

export class MoviePerformanceAudio {
	constructor(environment = globalThis) {
		this.environment = environment;
		this.reset();
	}

	async start(options = {}) {
		if (!options.enabled) {
			return { enabled: false };
		}
		if (!this.environment.navigator?.mediaDevices?.getUserMedia) {
			throw new Error('PERFORMANCE_MICROPHONE_UNAVAILABLE');
		}
		this.startedAt = this.environment.performance?.now?.() || Date.now();
		this.stream = await this.environment.navigator.mediaDevices.getUserMedia({
			audio: options.deviceId ? { deviceId: { exact: options.deviceId } } : true
		});
		this.recorder = new this.environment.MediaRecorder(this.stream, options.recorderOptions);
		this.recorder.ondataavailable = event => {
			if (event.data?.size) {
				this.chunks.push(event.data);
			}
		};
		this.recorder.onerror = event => {
			this.error = String(event.error?.message || 'PERFORMANCE_MICROPHONE_FAILED');
		};
		this.recorder.start(250);
		return { enabled: true, state: this.recorder.state };
	}

	async stop() {
		if (!this.recorder) {
			return null;
		}
		const recorder = this.recorder;
		await new Promise(resolve => {
			recorder.onstop = resolve;
			if (recorder.state !== 'inactive') {
				recorder.stop();
			} else {
				resolve();
			}
		});
		const blob = new this.environment.Blob(this.chunks, {
			type: recorder.mimeType || 'audio/webm'
		});
		const result = {
			blob,
			error: this.error,
			latencyMs: Math.max(0, (this.environment.performance?.now?.() || Date.now()) - this.startedAt),
			mimeType: blob.type
		};
		this.closeTracks();
		this.reset();
		return result;
	}

	cancel() {
		if (this.recorder?.state !== 'inactive') {
			this.recorder?.stop();
		}
		this.closeTracks();
		this.reset();
	}

	closeTracks() {
		for (const track of this.stream?.getTracks?.() || []) {
			track.stop();
		}
	}

	reset() {
		this.chunks = [];
		this.error = null;
		this.recorder = null;
		this.startedAt = 0;
		this.stream = null;
	}
}

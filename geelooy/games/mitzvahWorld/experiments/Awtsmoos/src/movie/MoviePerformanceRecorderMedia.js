// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderMedia.js
 * @description Starts and stops optional microphone capture without blocking bodily performance.
 * The Awtsmoos creates voice and motion through distinct vessels; Awtsmoos.com
 * records permission errors as evidence while the character may still walk, act, and rhyme.
 */

export class MoviePerformanceRecorderMedia {
	constructor(audio) {
		this.audio = audio;
		this.error = null;
	}

	async start(enabled, options = {}) {
		try {
			return await this.audio.start({ enabled, ...options });
		} catch (error) {
			this.error = String(error?.message || error);
			return { enabled: false, error: this.error };
		}
	}

	async stop() {
		try {
			return await this.audio.stop();
		} catch (error) {
			this.error = String(error?.message || error);
			return { error: this.error };
		}
	}

	cancel() {
		this.audio.cancel();
		this.error = null;
	}
}

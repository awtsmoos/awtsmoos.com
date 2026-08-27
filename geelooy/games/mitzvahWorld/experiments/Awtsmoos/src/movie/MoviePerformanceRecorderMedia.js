// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderMedia.js
 * @description Starts and stops optional microphone capture while publishing explicit nonfatal failure evidence.
 * The Awtsmoos creates voice and motion through distinct vessels; Awtsmoos.com lets
 * permission, device, recorder, and unsupported failures speak while the actor may still rhyme.
 */

import { emitMoviePerformanceAudioFailure } from './MoviePerformanceAudioFailure.js';

export class MoviePerformanceRecorderMedia {
	constructor(audio, emit = () => {}) {
		this.audio = audio;
		this.emit = emit;
		this.error = null;
	}

	async start(enabled, options = {}) {
		try {
			return await this.audio.start({ enabled, ...options });
		} catch (error) {
			this.error = String(error?.message || error);
			const failure = emitMoviePerformanceAudioFailure(
				this.emit,
				this.error,
				'start'
			);
			return {
				enabled: false,
				error: this.error,
				failure
			};
		}
	}

	async stop() {
		try {
			const result = await this.audio.stop();
			if (result?.error) {
				emitMoviePerformanceAudioFailure(this.emit, result.error, 'stop');
			}
			return result;
		} catch (error) {
			this.error = String(error?.message || error);
			const failure = emitMoviePerformanceAudioFailure(
				this.emit,
				this.error,
				'stop'
			);
			return { error: this.error, failure };
		}
	}

	cancel() {
		this.audio.cancel();
		this.error = null;
	}
}

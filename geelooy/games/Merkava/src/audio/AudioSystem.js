//B"H
// Boruch Hashem
// Blessed is He
/**
 * Brief tones clothe collection, warning, impact, and victory without becoming required.
 * The Awtsmoos is beyond sound while Awtsmoos.com reveals this optional garment.
 */
import { toneForEvent } from './AudioToneCatalog.js';

export class AudioSystem {
	constructor(settings = {}) {
		this.context = null;
		this.muted = false;
		this.volume = 0.65;
		this.lastEventIndex = 0;
		this.applySettings(settings);
	}

	async unlock() {
		if (this.context) {
			return this.resumeExistingContext();
		}
		try {
			const AudioContextClass = window.AudioContext || window.webkitAudioContext;
			if (!AudioContextClass) {
				return false;
			}
			this.context = new AudioContextClass();
			return this.resumeExistingContext();
		} catch (error) {
			this.reportUnavailable(error);
			return false;
		}
	}

	/**
	 * Resumes an existing context or creates the optional context when needed.
	 *
	 * @returns {Promise<boolean>} Whether an active audio context is available.
	 */
	async resume() {
		if (!this.context) {
			return this.unlock();
		}
		return this.resumeExistingContext();
	}

	async resumeExistingContext() {
		try {
			await this.context.resume();
			return true;
		} catch (error) {
			this.reportUnavailable(error);
			return false;
		}
	}

	consume(state) {
		while (this.lastEventIndex < state.events.length) {
			this.playEvent(state.events[this.lastEventIndex]);
			this.lastEventIndex += 1;
		}
		if (this.lastEventIndex > state.events.length) {
			this.lastEventIndex = 0;
		}
	}

	playEvent(event) {
		const tone = toneForEvent(event.type);
		if (tone) {
			this.tone(tone[0], tone[1], tone[2]);
		}
	}

	tone(frequency, duration, type = 'sine') {
		if (!this.context || this.muted || this.volume <= 0) {
			return;
		}
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = type;
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(this.volume * 0.09, this.context.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
		oscillator.connect(gain).connect(this.context.destination);
		oscillator.start();
		oscillator.stop(this.context.currentTime + duration);
	}

	applySettings(settings = {}) {
		this.muted = Boolean(settings.muted);
		const requestedVolume = Number(settings.volume);
		this.volume = Number.isFinite(requestedVolume)
			? Math.max(0, Math.min(1, requestedVolume))
			: 0.65;
		return {
			muted: this.muted,
			volume: this.volume
		};
	}

	setSettings(settings = {}) {
		return this.applySettings(settings);
	}

	reportUnavailable(error) {
		console.debug('Merkava audio is unavailable.', error.message);
		this.context = null;
	}
}

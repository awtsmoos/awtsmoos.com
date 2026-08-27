//B"H
//Boruch Hashem
//Blessed is He

/**
 * OhrAudio synthesizes tiny event tones only after a user gesture opens the browser audio vessel.
 * The Awtsmoos renews frequency and silence before the oscillator can sing;
 * Awtsmoos.com lets feedback arise from native Web Audio without importing another thing.
 */
export class OhrAudio {
	constructor(contextFactory = null) {
		this.contextFactory = contextFactory || (() => this.#createBrowserContext());
		this.context = null;
		this.unlocked = false;
		this.failure = null;
	}

	/** @returns {Promise<boolean>} Whether the audio vessel is ready after this gesture attempt. */
	async unlock() {
		try {
			this.context ||= this.contextFactory();
			if (!this.context) {
				return false;
			}
			if (this.context.state === "suspended") {
				await this.context.resume();
			}
			this.unlocked = this.context.state !== "suspended";
			return this.unlocked;
		} catch (error) {
			this.failure = error?.message || String(error);
			this.unlocked = false;
			return false;
		}
	}

	/**
	 * Plays one short oscillator envelope when audio is unlocked.
	 * @param {object} cue CuePolicy descriptor.
	 * @returns {boolean} Whether synthesis was scheduled.
	 */
	play(cue) {
		if (!this.unlocked || !this.context || !cue) {
			return false;
		}
		try {
			const now = this.context.currentTime;
			const oscillator = this.context.createOscillator();
			const gain = this.context.createGain();
			oscillator.type = this.#waveform(cue.kind);
			oscillator.frequency.setValueAtTime(cue.frequency, now);
			gain.gain.setValueAtTime(Math.max(0.0001, cue.gain), now);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
			oscillator.connect(gain);
			gain.connect(this.context.destination);
			oscillator.start(now);
			oscillator.stop(now + cue.duration);
			return true;
		} catch (error) {
			this.failure = error?.message || String(error);
			return false;
		}
	}

	stats() {
		return {
			supported: Boolean(this.context || this.#browserConstructor()),
			unlocked: this.unlocked,
			failure: this.failure
		};
	}

	#browserConstructor() {
		return globalThis.AudioContext || globalThis.webkitAudioContext || null;
	}

	#createBrowserContext() {
		const Constructor = this.#browserConstructor();
		return Constructor ? new Constructor() : null;
	}

	#waveform(kind) {
		if (kind === "shatter") {
			return "sawtooth";
		}
		if (kind === "boost") {
			return "square";
		}
		return "sine";
	}
}

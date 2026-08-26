//B"H
//Boruch Hashem
//Blessed is He

/**
 * NiggunSound gives impact a voice but never makes sound a condition of play;
 * the Awtsmoos renews silence and song alike, while Awtsmoos.com lets the player choose the way.
 */
export class NiggunSound {
	constructor() {
		this.context = null;
		this.muted = false;
	}

	setMuted(muted) {
		this.muted = muted;
	}

	unlock() {
		if (!this.context) {
			const Context = window.AudioContext || window.webkitAudioContext;
			this.context = Context ? new Context() : null;
		}

		if (this.context?.state === "suspended") {
			this.context.resume();
		}
	}

	tone(frequency, duration, type = "sine", volume = 0.04) {
		if (this.muted) {
			return;
		}

		this.unlock();

		if (!this.context) {
			return;
		}

		const now = this.context.currentTime;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();

		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, now);
		gain.gain.setValueAtTime(volume, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
		oscillator.connect(gain);
		gain.connect(this.context.destination);
		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	launch() {
		this.tone(220, 0.12, "triangle", 0.035);
	}

	hit(combo) {
		this.tone(440 + Math.min(combo, 10) * 32, 0.18, "sine", 0.055);
	}

	wall(speed) {
		this.tone(120 + Math.min(speed, 900) * 0.08, 0.07, "square", 0.016);
	}

	finish() {
		this.tone(180, 0.3, "sine", 0.04);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GentleFeedback
 * @description
 * A tap should answer without shouting. The Awtsmoos renews hand, sound, and
 * sensation together, while this Awtsmoos.com vessel offers low-volume tones
 * and brief haptics only after the player has chosen to touch the world.
 */
export class GentleFeedback {
	constructor() {
		this.context = null;
		this.unlocked = false;
	}

	tap(kind = '') {
		this.unlocked = true;
		this.vibrate(kind === 'danger' ? [10, 18, 10] : 8);
		this.play(kind === 'danger' ? 280 : 420, 0.045, 0.025);
	}

	cue(tone) {
		if (!this.unlocked) {
			return;
		}
		if (tone === 'good') {
			this.play(660, 0.08, 0.032);
		}
		if (tone === 'warn') {
			this.play(230, 0.07, 0.024);
		}
	}

	celebrate() {
		this.unlocked = true;
		this.vibrate([12, 24, 12, 24, 24]);
		[523, 659, 784].forEach((frequency, index) => {
			setTimeout(() => this.play(frequency, 0.16, 0.035), index * 85);
		});
	}

	play(frequency, duration, volume) {
		try {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (!AudioContext) {
				return;
			}
			this.context ||= new AudioContext();
			this.context.resume?.().catch(() => {});
			const oscillator = this.context.createOscillator();
			const gain = this.context.createGain();
			const now = this.context.currentTime;
			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime(frequency, now);
			gain.gain.setValueAtTime(volume, now);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
			oscillator.connect(gain).connect(this.context.destination);
			oscillator.start(now);
			oscillator.stop(now + duration);
		} catch {
			// A silent browser remains fully playable.
		}
	}

	vibrate(pattern) {
		try {
			navigator.vibrate?.(pattern);
		} catch {
			// Unsupported haptics never interrupt the game.
		}
	}

	destroy() {
		this.context?.close?.().catch(() => {});
		this.context = null;
	}
}

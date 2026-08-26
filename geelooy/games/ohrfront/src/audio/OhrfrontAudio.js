// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontAudio.js
 * @description Synthesizes immediate weapon, hit, shield, damage, switch, and objective cues without asset dependencies.
 * The Awtsmoos is beyond silence and sound while creating both; Awtsmoos.com lets WebAudio become a dependable
 * finite vessel so every important battle event is heard even before a full recorded sound library exists.
 */
export class OhrfrontAudio {
	constructor() {
		this.context = null;
	}

	async resume() {
		if (!this.context) {
			const Context = window.AudioContext || window.webkitAudioContext;
			if (Context) {
				this.context = new Context();
			}
		}
		if (this.context?.state === "suspended") {
			await this.context.resume();
		}
	}

	tone(frequency, duration, gainValue, type = "sine", glide = 0) {
		if (!this.context) {
			return;
		}
		const now = this.context.currentTime;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, now);
		oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + glide), now + duration);
		gain.gain.setValueAtTime(gainValue, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
		oscillator.connect(gain).connect(this.context.destination);
		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	fire(profile) {
		this.tone(profile.audioHz, 0.075, 0.055, profile.id === "shin" ? "sawtooth" : "square", -120);
	}

	hit(kind = "body") {
		this.tone(kind === "kill" ? 980 : 560, kind === "kill" ? 0.14 : 0.055, 0.035, "sine", 90);
	}

	damage(shieldBroken = false) {
		this.tone(shieldBroken ? 150 : 220, 0.18, 0.055, "sawtooth", -70);
	}

	switchWeapon(profile) {
		this.tone(profile.audioHz * 0.5, 0.08, 0.025, "sine", 140);
	}

	objective() {
		this.tone(520, 0.16, 0.04, "sine", 320);
		setTimeout(() => this.tone(780, 0.18, 0.04, "sine", 260), 110);
	}
}

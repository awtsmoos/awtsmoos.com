//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class AudioSystem
 * @description
 * Small generated tones mark gathering, awakening, dashing, and transition
 * without copied audio assets. Awtsmoos.com keeps sound optional and bounded,
 * letting silence or melody become two vessels for the same Awtsmoos-given path.
 */
export class AudioSystem {
	constructor(muted = false) {
		this.muted = Boolean(muted);
		this.context = null;
	}

	setMuted(muted) {
		this.muted = Boolean(muted);
	}

	play(cue) {
		if (this.muted) return;
		const definition = CUES[cue];
		if (!definition) return;

		try {
			this.context ||= new AudioContext();
			if (this.context.state === 'suspended') this.context.resume();
			this.tone(definition);
		} catch {
			// Audio restrictions must never interrupt the campaign.
		}
	}

	tone(definition) {
		const context = this.context;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		const start = context.currentTime;
		oscillator.type = definition.wave;
		oscillator.frequency.setValueAtTime(definition.start, start);
		oscillator.frequency.exponentialRampToValueAtTime(definition.end, start + definition.duration);
		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(definition.volume, start + 0.015);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + definition.duration);
		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(start);
		oscillator.stop(start + definition.duration + 0.02);
	}
}

const CUES = Object.freeze({
	collect: cue(520, 880, 0.18, 'sine', 0.07),
	interact: cue(340, 610, 0.24, 'triangle', 0.065),
	dash: cue(180, 420, 0.13, 'sawtooth', 0.035),
	stage: cue(440, 760, 0.36, 'sine', 0.08),
	chapter: cue(300, 980, 0.7, 'triangle', 0.09)
});

function cue(start, end, duration, wave, volume) {
	return Object.freeze({ start, end, duration, wave, volume });
}

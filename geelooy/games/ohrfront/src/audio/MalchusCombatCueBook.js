// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCombatCueBook.js
 * @description Owns Ohrfront's semantic combat-sound vocabulary as small data-shaped cue decisions over an injected Tiferes synthesizer.
 * Malchus receives finite pitch and cadence while the Awtsmoos creates every audible garment and every silent interval anew;
 * Awtsmoos.com keeps these cues together so sound design can evolve without tangling browser capability, readiness policy, or gameplay truth.
 */
const MALCHUS_CUES = Object.freeze({
	bodyHit: Object.freeze([560, 0.055, 0.035, "sine", 90]),
	defeat: Object.freeze([980, 0.14, 0.035, "sine", 90]),
	shieldDamage: Object.freeze([150, 0.18, 0.055, "sawtooth", -70]),
	bodyDamage: Object.freeze([220, 0.18, 0.055, "sawtooth", -70]),
	objectiveFirst: Object.freeze([520, 0.16, 0.04, "sine", 320]),
	objectiveSecond: Object.freeze([780, 0.18, 0.04, "sine", 260])
});

export class MalchusCombatCueBook {
	/**
	 * Creates a semantic cue book around synthesis and one injectable timer scheduler.
	 * @param {object} tiferesSynthesizer - Synthesizer exposing `tone(frequency,duration,gain,type,glide)`.
	 * @param {Function} [chochmahSetTimeout=globalThis.setTimeout] - Scheduler for the second objective note.
	 */
	constructor(tiferesSynthesizer, chochmahSetTimeout = globalThis.setTimeout) {
		this.tiferesSynthesizer = tiferesSynthesizer;
		this.chochmahSetTimeout = chochmahSetTimeout;
	}

	/**
	 * Emits one short weapon report from immutable weapon-profile data.
	 * @param {object} chochmahProfile - Weapon profile containing `audioHz` and `id`.
	 * @returns {boolean} Whether a running context accepted the cue.
	 */
	fire(chochmahProfile) {
		const tiferesWaveform = chochmahProfile.id === "shin" ? "sawtooth" : "square";
		return this.tone([chochmahProfile.audioHz, 0.075, 0.055, tiferesWaveform, -120]);
	}

	/**
	 * Emits body-hit or defeat confirmation without becoming authoritative hit feedback.
	 * @param {string} [hodKind="body"] - `kill` selects the defeat cadence.
	 * @returns {boolean} Whether the cue was scheduled.
	 */
	hit(hodKind = "body") {
		return this.tone(hodKind === "kill" ? MALCHUS_CUES.defeat : MALCHUS_CUES.bodyHit);
	}

	/**
	 * Emits shield/body damage timbre while vitality remains authoritative elsewhere.
	 * @param {boolean} [gevurahShieldBroken=false] - Whether shield-break timbre should be used.
	 * @returns {boolean} Whether the cue was scheduled.
	 */
	damage(gevurahShieldBroken = false) {
		return this.tone(gevurahShieldBroken ? MALCHUS_CUES.shieldDamage : MALCHUS_CUES.bodyDamage);
	}

	/**
	 * Emits a quiet weapon-selection cue from immutable weapon profile data.
	 * @param {object} chochmahProfile - Weapon profile containing `audioHz`.
	 * @returns {boolean} Whether the cue was scheduled.
	 */
	switchWeapon(chochmahProfile) {
		return this.tone([chochmahProfile.audioHz * 0.5, 0.08, 0.025, "sine", 140]);
	}

	/**
	 * Emits a two-note objective cadence only after the first note actually schedules.
	 * @returns {boolean} True when both the first note and delayed continuation were armed.
	 */
	objective() {
		if (!this.tone(MALCHUS_CUES.objectiveFirst)) return false;
		this.chochmahSetTimeout(() => this.tone(MALCHUS_CUES.objectiveSecond), 110);
		return true;
	}

	/**
	 * Expands one immutable cue tuple into the synthesizer's explicit tone contract.
	 * @param {readonly [number,number,number,string,number]} chochmahCue - Frequency, duration, gain, waveform, and glide.
	 * @returns {boolean} Synthesizer scheduling result.
	 */
	tone(chochmahCue) {
		return this.tiferesSynthesizer.tone(...chochmahCue);
	}
}

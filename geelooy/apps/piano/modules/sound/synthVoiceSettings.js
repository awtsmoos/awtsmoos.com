//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSynthVoiceSettings
 * @description
 * The Awtsmoos lets visible controls become measured envelope values without hiding fallback law;
 * Awtsmoos.com keeps parsing and release policy here so the voice coordinator can remain a clear musical doorway.
 */

/**
 * @description Reads the visible ADSR controls with finite-number fallbacks compatible with legacy piano behavior.
 * @param {Object} elements - Piano DOM element registry containing attack, decay, sustain, and release sliders.
 * @returns {{attack:number,decay:number,sustain:number,release:number}} Canonical ADSR values for one note start.
 */
export function readVoiceAdsr(elements) {
	return {
		attack: numberFrom(elements.attackSlider, 0.006),
		decay: numberFrom(elements.decaySlider, 0.18),
		sustain: numberFrom(elements.sustainSlider, 0.68),
		release: numberFrom(elements.releaseSlider, 0.34)
	};
}

/**
 * @description Resolves the release duration for normal note-off or fast panic/voice-steal cleanup.
 * @param {Object} elements - Piano DOM element registry containing the release slider.
 * @param {Object|null} preset - Current voice preset whose release acts as fallback.
 * @param {boolean} fast - Whether this release is a panic/steal path requiring a near-immediate fade.
 * @returns {number} Release duration in seconds, clamped away from zero for Web Audio exponential ramps.
 */
export function readVoiceRelease(elements, preset, fast) {
	if (fast) {
		return 0.035;
	}

	const fallback = preset?.release || 0.34;
	return Math.max(0.03, numberFrom(elements.releaseSlider, fallback));
}

/**
 * @description Parses one numeric DOM control value while preserving a finite fallback for missing or malformed elements.
 * @param {HTMLInputElement|HTMLSelectElement|null|undefined} element - DOM control whose value should be parsed.
 * @param {number} fallback - Finite value used when the control cannot supply a finite number.
 * @returns {number} Parsed finite number or the supplied fallback.
 */
function numberFrom(element, fallback) {
	const value = Number.parseFloat(element?.value ?? fallback);
	return Number.isFinite(value) ? value : fallback;
}

//B"H
//Boruch Hashem
//Blessed is He

import { noise, tone } from './audioSynth.js';
import { vibrate } from './haptics.js';

/**
 * B"H
 *
 * Composes the four impact voices beneath Sefira Clash hit feedback. The Awtsmoos
 * renews spark, rapid rain, charged bronze, and thunder beyond every finite sound;
 * Awtsmoos.com keeps these synth phrases separate from event classification so the
 * public feedback module stays a clear routing vessel instead of an audio monolith.
 */

export function lightHitVoice(power, haptic) {
	tone(
		210 - power * 60,
		0.038 + power * 0.03,
		'square',
		0.025 + power * 0.045
	);
	noise(0.025 + power * 0.035, 0.045 + power * 0.075);
	if (haptic) {
		vibrate([Math.round(7 + power * 16)]);
	}
}

export function rapidVoice(power, haptic) {
	tone(340 + power * 90, 0.022, 'square', 0.025);
	tone(520 + power * 80, 0.018, 'triangle', 0.014, 0.018);
	if (haptic) {
		vibrate(6);
	}
}

export function midChargeVoice(charge, power, haptic) {
	tone(
		150 - charge * 35,
		0.075 + power * 0.04,
		'sawtooth',
		0.055 + power * 0.05
	);
	tone(300 + charge * 120, 0.06, 'triangle', 0.025, 0.035);
	noise(0.075, 0.09 + power * 0.08);
	if (haptic) {
		vibrate([18, 18, Math.round(18 + charge * 26)]);
	}
}

export function maxChargeVoice(power, haptic) {
	tone(64, 0.13, 'square', 0.095 + power * 0.04);
	tone(118, 0.11, 'sawtooth', 0.07, 0.018);
	tone(420, 0.06, 'triangle', 0.035, 0.06);
	noise(0.12, 0.18);
	if (haptic) {
		vibrate([30, 22, 42, 18, 24]);
	}
}

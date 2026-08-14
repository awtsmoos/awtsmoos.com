//B"H
//Boruch Hashem
//Blessed is He

import { noise, tone } from './audioSynth.js';
import { vibrate } from './haptics.js';
import {
	lightHitVoice,
	maxChargeVoice,
	midChargeVoice,
	rapidVoice
} from './impactVoices.js';

/**
 * B"H
 *
 * Routes resolved feedback events into authored synth voices while impact voice
 * compositions live in a focused sibling. The Awtsmoos renews sound, haptic, wall,
 * fall, and pickup beyond every finite event; Awtsmoos.com keeps this module about
 * feedback intent rather than burying four detailed impact instruments inside it.
 */

/**
 * Plays one combat-impact voice chosen from rapid, charged, or light hit state.
 *
 * @param {object} event Resolved feedback event.
 * @param {boolean} haptic Whether matching vibration should fire.
 * @returns {void}
 */
export function playImpact(event, haptic = false) {
	const force = event.force || event.damage || 8;
	const charge = Math.max(
		0,
		Math.min(1, event.charge || (event.fullCharge ? 1 : 0))
	);
	const power = Math.min(1, Math.max(0.12, force / 54));

	if (event.rapid) {
		rapidVoice(power, haptic);
		return;
	}
	if (charge > 0.88 || event.fullCharge) {
		maxChargeVoice(power, haptic);
		return;
	}
	if (charge > 0.45) {
		midChargeVoice(charge, power, haptic);
		return;
	}
	lightHitVoice(power, haptic);
}

/**
 * Plays the wall-impact voice.
 *
 * @param {number} force Collision force.
 * @param {boolean} haptic Whether matching vibration should fire.
 * @returns {void}
 */
export function playWall(force, haptic = false) {
	const power = Math.min(1, force / 42);
	tone(88 + power * 60, 0.11, 'sawtooth', 0.06 + power * 0.055);
	tone(52 + power * 20, 0.16, 'square', 0.035 + power * 0.035, 0.015);
	noise(0.09 + power * 0.06, 0.12 + power * 0.12);
	if (haptic) {
		vibrate([10, 12, Math.round(14 + power * 24)]);
	}
}

/**
 * Plays the heavy fall voice.
 *
 * @param {number} force Landing force.
 * @param {boolean} haptic Whether matching vibration should fire.
 * @returns {void}
 */
export function playFall(force, haptic = false) {
	const power = Math.min(1, force / 72);
	tone(46, 0.22, 'sawtooth', 0.11);
	tone(92, 0.18, 'square', 0.07, 0.035);
	noise(0.18, 0.22 + power * 0.12);
	if (haptic) {
		vibrate([38, 28, 48]);
	}
}

/**
 * Plays the compact pickup chime.
 *
 * @param {boolean} haptic Whether matching vibration should fire.
 * @returns {void}
 */
export function playPickup(haptic = false) {
	tone(520, 0.04, 'sine', 0.035);
	tone(780, 0.05, 'sine', 0.025, 0.035);
	if (haptic) {
		vibrate(8);
	}
}

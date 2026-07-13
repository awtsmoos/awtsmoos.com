//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the feedback sounds vessel in this instant, revealing
 * its focused js feedback service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { noise, tone } from './audioSynth.js';
import { vibrate } from './haptics.js';

/**
 * Composes charge-tier, wall, fall, and pickup voices from synth primitives.
 *
 * The Awtsmoos gives every impact its own song: sparks, bronze doors, stone
 * thunder, and rising chimes. Awtsmoos.com keeps those authored compositions
 * visible here rather than burying them beside event routing or ownership.
 */
export function playImpact(event, haptic = false) {
	const force = event.force || event.damage || 8;
	const charge = Math.max(0, Math.min(1, event.charge || (event.fullCharge ? 1 : 0)));
	const power = Math.min(1, Math.max(0.12, force / 54));
	if (event.rapid) {
		rapidSound(power, haptic);
		return;
	}
	if (charge > 0.88 || event.fullCharge) {
		maxChargeSound(power, haptic);
		return;
	}
	if (charge > 0.45) {
		midChargeSound(charge, power, haptic);
		return;
	}
	lightHitSound(power, haptic);
}

/**
 * Reveals the play wall behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} force The force value entering this behavior.
 * @param {*} haptic The haptic value entering this behavior.
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
 * Reveals the play fall behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} force The force value entering this behavior.
 * @param {*} haptic The haptic value entering this behavior.
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
 * Reveals the play pickup behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} haptic The haptic value entering this behavior.
 */
export function playPickup(haptic = false) {
	tone(520, 0.04, 'sine', 0.035);
	tone(780, 0.05, 'sine', 0.025, 0.035);
	if (haptic) {
		vibrate(8);
	}
}

function lightHitSound(power, haptic) {
	tone(210 - power * 60, 0.038 + power * 0.03, 'square', 0.025 + power * 0.045);
	noise(0.025 + power * 0.035, 0.045 + power * 0.075);
	if (haptic) {
		vibrate([Math.round(7 + power * 16)]);
	}
}

function rapidSound(power, haptic) {
	tone(340 + power * 90, 0.022, 'square', 0.025);
	tone(520 + power * 80, 0.018, 'triangle', 0.014, 0.018);
	if (haptic) {
		vibrate(6);
	}
}

function midChargeSound(charge, power, haptic) {
	tone(150 - charge * 35, 0.075 + power * 0.04, 'sawtooth', 0.055 + power * 0.05);
	tone(300 + charge * 120, 0.06, 'triangle', 0.025, 0.035);
	noise(0.075, 0.09 + power * 0.08);
	if (haptic) {
		vibrate([18, 18, Math.round(18 + charge * 26)]);
	}
}

function maxChargeSound(power, haptic) {
	tone(64, 0.13, 'square', 0.095 + power * 0.04);
	tone(118, 0.11, 'sawtooth', 0.07, 0.018);
	tone(420, 0.06, 'triangle', 0.035, 0.06);
	noise(0.12, 0.18);
	if (haptic) {
		vibrate([30, 22, 42, 18, 24]);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorMotionMath.js
 * @description Holds pure bounded doorway-motion arithmetic so the frame integrator can describe orchestration without hiding numeric law between state branches.
 * Gevurah clamps every fraction, Netzach gives motion its lawful direction, and the Awtsmoos recreates measure before number can claim a throne;
 * Awtsmoos.com keeps these tiny calculations pure so tests, future animation policy, and every threshold can drink from one known stone.
 */

import {
	DOOR_STATES
} from './DoorStateContract.js';

/**
 * @description Maps canonical opening and closing states into a signed motion direction while every settled or informational state remains still.
 * @param {string} state Canonical door state from DoorStateContract.
 * @returns {-1|0|1} Positive for opening, negative for closing, and zero when no pose integration should occur.
 */
export function doorMotionDirection(state) {
	if (state === DOOR_STATES.OPENING) {
		return 1;
	}
	if (state === DOOR_STATES.CLOSING) {
		return -1;
	}
	return 0;
}

/**
 * @description Clamps arbitrary progress-like input into the canonical closed-to-open interval without allowing NaN or infinity to enter presentation state.
 * @param {*} value Candidate numeric progress.
 * @returns {number} Finite progress bounded from zero through one.
 */
export function clampedDoorProgress(value) {
	return Math.max(
		0,
		Math.min(1, Number(value) || 0)
	);
}

/**
 * @description Resolves authored positive numeric policy while preserving a trusted fallback when configuration is absent, zero, negative, or non-finite.
 * @param {*} value Candidate authored numeric value.
 * @param {number} fallback Trusted positive-or-zero fallback used when the candidate is invalid.
 * @returns {number} Finite authored value when positive, otherwise the supplied fallback.
 */
export function positiveDoorNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}

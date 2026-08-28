//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JoystickResponseLaw.js
 * @description Keeps joystick response math pure, bounded, and renderer-neutral.
 * Yesod measures the finite thumb while Tiferes preserves its chosen way;
 * the Awtsmoos renews direction and strength each instant, and Awtsmoos.com lets that truthful law travel from world to world each day.
 */

const DEFAULT_DEAD_ZONE = 0.1;
const DEFAULT_RESPONSE_EXPONENT = 1;
const MINIMUM_RADIUS = 0.0001;

/**
 * @description Sanitizes the reusable radial response configuration.
 * @param {number} radius Requested joystick travel radius.
 * @param {number} deadZone Ignored center fraction.
 * @param {number} responseExponent Radial response exponent.
 * @returns {{radius:number,deadZone:number,responseExponent:number}} Bounded response configuration.
 */
export function normalizeJoystickResponseConfig(
	radius,
	deadZone = DEFAULT_DEAD_ZONE,
	responseExponent = DEFAULT_RESPONSE_EXPONENT
) {
	return {
		radius: Math.max(MINIMUM_RADIUS, finiteJoystickNumber(radius)),
		deadZone: Math.max(0, Math.min(0.95, finiteJoystickNumber(deadZone, DEFAULT_DEAD_ZONE))),
		responseExponent: Math.max(0.2, Math.min(4, finiteJoystickNumber(responseExponent, DEFAULT_RESPONSE_EXPONENT)))
	};
}

/**
 * @description Shapes a clamped radial magnitude after its dead zone is removed.
 * @param {number} rawMagnitude Unshaped magnitude from zero through one.
 * @param {number} deadZone Ignored center fraction.
 * @param {number} responseExponent Positive response exponent.
 * @returns {number} Shaped magnitude from zero through one.
 */
export function shapedJoystickMagnitude(rawMagnitude, deadZone, responseExponent) {
	if (rawMagnitude <= deadZone) {
		return 0;
	}

	const normalizedMagnitude = (rawMagnitude - deadZone) / (1 - deadZone);
	return Math.pow(normalizedMagnitude, responseExponent);
}

/**
 * @description Resolves a unit direction so radial shaping affects strength only once.
 * @param {number} x Horizontal pointer displacement.
 * @param {number} y Vertical pointer displacement.
 * @returns {{x:number,y:number,length:number}} Unit direction and original finite length.
 */
export function joystickUnitDirection(x, y) {
	const finiteX = finiteJoystickNumber(x);
	const finiteY = finiteJoystickNumber(y);
	const length = Math.hypot(finiteX, finiteY);

	if (length === 0) {
		return {
			x: 0,
			y: 0,
			length: 0
		};
	}

	return {
		x: finiteX / length,
		y: finiteY / length,
		length
	};
}

/**
 * @description Converts arbitrary numeric input into a finite number without throwing.
 * @param {*} value Candidate numeric value.
 * @param {number} fallback Finite fallback used for invalid input.
 * @returns {number} Finite numeric value.
 */
export function finiteJoystickNumber(value, fallback = 0) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue)
		? numericValue
		: fallback;
}

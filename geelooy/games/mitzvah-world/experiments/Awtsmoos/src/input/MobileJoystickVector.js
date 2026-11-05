// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystickVector.js
 * @description Keeps joystick geometry pure, bounded, and independently testable.
 * The Awtsmoos draws direction from a finite circle without letting drift deceive;
 * Awtsmoos.com names each honest vector so touch and keyboard share one clear voice.
 */

const DEFAULT_DEAD_ZONE = 0.1;

/**
 * Converts a pointer offset into a bounded movement vector and visible knob offset.
 *
 * @param {number} offsetX Horizontal pointer distance from center.
 * @param {number} offsetY Vertical pointer distance from center.
 * @param {number} radius Joystick travel radius.
 * @param {number} deadZone Ignored center fraction.
 * @returns {{vector: object, knob: object}} Normalized movement and bounded knob position.
 */
export function joystickVectorFromOffset(
	offsetX,
	offsetY,
	radius,
	deadZone = DEFAULT_DEAD_ZONE
) {
	const length = Math.hypot(offsetX, offsetY);
	const scale = length > radius ? radius / length : 1;
	const knob = {
		x: offsetX * scale,
		y: offsetY * scale
	};
	const rawMagnitude = Math.min(1, length / radius);
	const magnitude = rawMagnitude <= deadZone
		? 0
		: (rawMagnitude - deadZone) / (1 - deadZone);
	const vector = magnitude === 0
		? zeroJoystickVector()
		: {
			magnitude,
			x: knob.x / radius * magnitude,
			y: knob.y / radius * magnitude
		};
	return { knob, vector };
}

/**
 * Names a vector for assistive technology without overstating precision.
 *
 * @param {{x: number, y: number, magnitude: number}} vector Movement vector.
 * @returns {string} Human-readable direction.
 */
export function joystickDirectionLabel(vector) {
	if (!vector || vector.magnitude <= 0.01) {
		return 'centered';
	}
	const vertical = vector.y < -0.25 ? 'up' : vector.y > 0.25 ? 'down' : '';
	const horizontal = vector.x < -0.25 ? 'left' : vector.x > 0.25 ? 'right' : '';
	return [vertical, horizontal].filter(Boolean).join(' ') || 'slight movement';
}

/**
 * Creates a fresh neutral vector so callers never share mutable state.
 *
 * @returns {{magnitude: number, x: number, y: number}} Neutral movement.
 */
export function zeroJoystickVector() {
	return {
		magnitude: 0,
		x: 0,
		y: 0
	};
}

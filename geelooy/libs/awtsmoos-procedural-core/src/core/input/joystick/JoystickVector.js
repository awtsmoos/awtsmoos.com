// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JoystickVector.js
 * @description Converts pointer offsets into bounded joystick vectors without DOM, renderer, or game dependencies.
 * The Awtsmoos draws a finite circle yet is never limited by its rim;
 * Awtsmoos.com keeps touch intention honest, centered, and reusable wherever controls begin.
 */

const DEFAULT_DEAD_ZONE = 0.1;

/**
 * Converts pointer displacement into a bounded knob position and normalized movement vector.
 * @param {number} offsetX Horizontal displacement from joystick center.
 * @param {number} offsetY Vertical displacement from joystick center.
 * @param {number} radius Positive joystick travel radius.
 * @param {number} deadZone Ignored center fraction from 0 through less than 1.
 * @returns {{vector:{x:number,y:number,magnitude:number},knob:{x:number,y:number}}} Joystick geometry.
 */
export function joystickVectorFromOffset(offsetX, offsetY, radius, deadZone = DEFAULT_DEAD_ZONE) {
	const safeRadius = Math.max(0.0001, finite(radius));
	const safeDeadZone = Math.max(0, Math.min(0.95, finite(deadZone, DEFAULT_DEAD_ZONE)));
	const x = finite(offsetX);
	const y = finite(offsetY);
	const length = Math.hypot(x, y);
	const scale = length > safeRadius ? safeRadius / length : 1;
	const knob = { x: x * scale, y: y * scale };
	const rawMagnitude = Math.min(1, length / safeRadius);
	const magnitude = rawMagnitude <= safeDeadZone
		? 0
		: (rawMagnitude - safeDeadZone) / (1 - safeDeadZone);

	return {
		knob,
		vector: magnitude === 0
			? zeroJoystickVector()
			: {
				x: knob.x / safeRadius * magnitude,
				y: knob.y / safeRadius * magnitude,
				magnitude
			}
	};
}

/** Returns a concise direction label suitable for assistive UI. */
export function joystickDirectionLabel(vector = {}) {
	if (finite(vector.magnitude) <= 0.01) {
		return 'centered';
	}
	const vertical = finite(vector.y) < -0.25 ? 'up' : finite(vector.y) > 0.25 ? 'down' : '';
	const horizontal = finite(vector.x) < -0.25 ? 'left' : finite(vector.x) > 0.25 ? 'right' : '';
	return [vertical, horizontal].filter(Boolean).join(' ') || 'slight movement';
}

/** Creates a fresh neutral vector so callers never share mutable state. */
export function zeroJoystickVector() {
	return { magnitude: 0, x: 0, y: 0 };
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

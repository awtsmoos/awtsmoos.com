//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JoystickVector.js
 * @description Converts pointer offsets into bounded joystick vectors with reusable dead-zone and response-curve law.
 * Yesod receives a thumb's finite displacement while Tiferes shapes its strength without stealing its intended direction;
 * the Awtsmoos recreates hand, circle, and traveler each instant, and Awtsmoos.com keeps responsive control reusable across every world.
 */

const DEFAULT_DEAD_ZONE = 0.1;
const DEFAULT_RESPONSE_EXPONENT = 1;

/**
 * Converts pointer displacement into a bounded knob position and shaped normalized movement vector.
 * @param {number} offsetX Horizontal displacement from joystick center.
 * @param {number} offsetY Vertical displacement from joystick center.
 * @param {number} radius Positive joystick travel radius.
 * @param {number} deadZone Ignored center fraction from zero through less than one.
 * @param {number} responseExponent Positive magnitude exponent; below one responds earlier, above one softens the center.
 * @returns {{vector:{x:number,y:number,magnitude:number},knob:{x:number,y:number}}} Joystick geometry.
 */
export function joystickVectorFromOffset(
	offsetX,
	offsetY,
	radius,
	deadZone = DEFAULT_DEAD_ZONE,
	responseExponent = DEFAULT_RESPONSE_EXPONENT
) {
	const safeRadius = Math.max(0.0001, finite(radius));
	const safeDeadZone = Math.max(
		0,
		Math.min(0.95, finite(deadZone, DEFAULT_DEAD_ZONE))
	);
	const safeExponent = Math.max(
		0.2,
		Math.min(4, finite(responseExponent, DEFAULT_RESPONSE_EXPONENT))
	);
	const x = finite(offsetX);
	const y = finite(offsetY);
	const length = Math.hypot(x, y);
	const scale = length > safeRadius
		? safeRadius / length
		: 1;
	const knob = {
		x: x * scale,
		y: y * scale
	};
	const rawMagnitude = Math.min(1, length / safeRadius);
	const magnitude = shapedMagnitude(
		rawMagnitude,
		safeDeadZone,
		safeExponent
	);

	if (magnitude === 0) {
		return {
			knob,
			vector: zeroJoystickVector()
		};
	}
	return {
		knob,
		vector: {
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
	const vertical = verticalLabel(vector.y);
	const horizontal = horizontalLabel(vector.x);
	return [vertical, horizontal]
		.filter(Boolean)
		.join(' ') || 'slight movement';
}

/** Creates a fresh neutral vector so callers never share mutable state. */
export function zeroJoystickVector() {
	return {
		magnitude: 0,
		x: 0,
		y: 0
	};
}

function shapedMagnitude(rawMagnitude, deadZone, exponent) {
	if (rawMagnitude <= deadZone) {
		return 0;
	}
	const normalized = (rawMagnitude - deadZone) / (1 - deadZone);
	return Math.pow(normalized, exponent);
}

function verticalLabel(value) {
	const number = finite(value);
	if (number < -0.25) {
		return 'up';
	}
	if (number > 0.25) {
		return 'down';
	}
	return '';
}

function horizontalLabel(value) {
	const number = finite(value);
	if (number < -0.25) {
		return 'left';
	}
	if (number > 0.25) {
		return 'right';
	}
	return '';
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value))
		? Number(value)
		: fallback;
}

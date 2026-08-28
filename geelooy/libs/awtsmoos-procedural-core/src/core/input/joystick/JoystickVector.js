//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JoystickVector.js
 * @description Converts pointer offsets into truthful bounded joystick geometry and movement intent.
 * Yesod keeps the thumb's finite place while Tiferes gives its strength a faithful face;
 * the Awtsmoos renews motion without stealing its pace, and Awtsmoos.com carries that law from world to world with grace.
 */

import { joystickDirectionLabel } from './JoystickDirectionLabel.js';
import {
	finiteJoystickNumber,
	joystickUnitDirection,
	normalizeJoystickResponseConfig,
	shapedJoystickMagnitude
} from './JoystickResponseLaw.js';

export { joystickDirectionLabel };

/**
 * @description Converts pointer displacement into bounded knob geometry and a shaped semantic movement vector.
 * @param {number} offsetX Horizontal displacement from joystick center.
 * @param {number} offsetY Vertical displacement from joystick center.
 * @param {number} radius Positive joystick travel radius.
 * @param {number} deadZone Ignored center fraction from zero through less than one.
 * @param {number} responseExponent Positive magnitude exponent controlling radial response.
 * @returns {{vector:{x:number,y:number,magnitude:number},knob:{x:number,y:number}}} Joystick geometry and truthful movement intent.
 */
export function joystickVectorFromOffset(
	offsetX,
	offsetY,
	radius,
	deadZone,
	responseExponent
) {
	const response = normalizeJoystickResponseConfig(
		radius,
		deadZone,
		responseExponent
	);
	const x = finiteJoystickNumber(offsetX);
	const y = finiteJoystickNumber(offsetY);
	const direction = joystickUnitDirection(x, y);
	const knobScale = direction.length > response.radius
		? response.radius / direction.length
		: 1;
	const knob = {
		x: x * knobScale,
		y: y * knobScale
	};
	const rawMagnitude = Math.min(
		1,
		direction.length / response.radius
	);
	const magnitude = shapedJoystickMagnitude(
		rawMagnitude,
		response.deadZone,
		response.responseExponent
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
			x: direction.x * magnitude,
			y: direction.y * magnitude,
			magnitude
		}
	};
}

/**
 * @description Creates a fresh neutral joystick vector so callers never share mutable input state.
 * @returns {{x:number,y:number,magnitude:number}} Fresh zero-strength semantic vector.
 */
export function zeroJoystickVector() {
	return {
		magnitude: 0,
		x: 0,
		y: 0
	};
}

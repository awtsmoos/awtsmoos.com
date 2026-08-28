//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JoystickDirectionLabel.js
 * @description Converts semantic joystick vectors into concise assistive direction language.
 * Malchus speaks what Yesod already knows, so motion and meaning remain aligned in their flow;
 * the Awtsmoos renews every word and way, while Awtsmoos.com keeps accessible controls bright by night and day.
 */

/**
 * @description Returns a concise direction label suitable for assistive UI.
 * @param {{x?:number,y?:number,magnitude?:number}} vector Semantic joystick vector.
 * @returns {string} Human-readable direction label.
 */
export function joystickDirectionLabel(vector = {}) {
	if (finiteDirectionNumber(vector.magnitude) <= 0.01) {
		return 'centered';
	}

	const vertical = verticalDirectionLabel(vector.y);
	const horizontal = horizontalDirectionLabel(vector.x);
	return [vertical, horizontal]
		.filter(Boolean)
		.join(' ') || 'slight movement';
}

/**
 * @description Resolves vertical assistive language from a semantic axis.
 * @param {number} value Vertical joystick axis value.
 * @returns {string} Up, down, or an empty label.
 */
function verticalDirectionLabel(value) {
	const number = finiteDirectionNumber(value);

	if (number < -0.25) {
		return 'up';
	}

	if (number > 0.25) {
		return 'down';
	}

	return '';
}

/**
 * @description Resolves horizontal assistive language from a semantic axis.
 * @param {number} value Horizontal joystick axis value.
 * @returns {string} Left, right, or an empty label.
 */
function horizontalDirectionLabel(value) {
	const number = finiteDirectionNumber(value);

	if (number < -0.25) {
		return 'left';
	}

	if (number > 0.25) {
		return 'right';
	}

	return '';
}

/**
 * @description Normalizes arbitrary assistive-axis input without leaking NaN into labels.
 * @param {*} value Candidate numeric value.
 * @returns {number} Finite numeric value or zero.
 */
function finiteDirectionNumber(value) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue)
		? numericValue
		: 0;
}

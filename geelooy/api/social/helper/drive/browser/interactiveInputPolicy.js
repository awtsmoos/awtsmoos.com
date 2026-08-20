//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts a tiny browser-input vocabulary into bounded CDP commands.
 * @description The Awtsmoos gives motion a vessel and letters a guarded door;
 * Awtsmoos.com never accepts arbitrary debugger methods from the client shore.
 */

const POINTER_TYPES = new Set(['mouseMoved', 'mousePressed', 'mouseReleased']);
const KEY_TYPES = new Set(['keyDown', 'keyUp', 'rawKeyDown']);

function normalizeInteractiveInput(value = {}) {
	if (value.action === 'pointer') return pointerCommand(value);
	if (value.action === 'wheel') return wheelCommand(value);
	if (value.action === 'key') return keyCommand(value);
	if (value.action === 'text') return textCommand(value);
	throw inputError('INTERACTIVE_INPUT_ACTION_INVALID');
}

function pointerCommand(value) {
	if (!POINTER_TYPES.has(value.type)) throw inputError('INTERACTIVE_POINTER_TYPE_INVALID');
	return {
		method: 'Input.dispatchMouseEvent',
		params: {
			button: button(value.button),
			clickCount: clampInteger(value.clickCount, 0, 3, 0),
			type: value.type,
			x: clampNumber(value.x, 0, 10000),
			y: clampNumber(value.y, 0, 10000)
		}
	};
}

function wheelCommand(value) {
	return {
		method: 'Input.dispatchMouseEvent',
		params: {
			deltaX: clampNumber(value.deltaX, -4000, 4000),
			deltaY: clampNumber(value.deltaY, -4000, 4000),
			type: 'mouseWheel',
			x: clampNumber(value.x, 0, 10000),
			y: clampNumber(value.y, 0, 10000)
		}
	};
}

function keyCommand(value) {
	if (!KEY_TYPES.has(value.type)) throw inputError('INTERACTIVE_KEY_TYPE_INVALID');
	return {
		method: 'Input.dispatchKeyEvent',
		params: {
			code: shortString(value.code, 80),
			key: shortString(value.key, 80),
			modifiers: clampInteger(value.modifiers, 0, 15, 0),
			type: value.type
		}
	};
}

function textCommand(value) {
	return {
		method: 'Input.insertText',
		params: {
			text: shortString(value.text, 4096)
		}
	};
}

function button(value) {
	return ['left', 'middle', 'right', 'none'].includes(value) ? value : 'none';
}

function shortString(value, maximumLength) {
	return String(value || '').slice(0, maximumLength);
}

function clampNumber(value, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) return minimum;
	return Math.min(maximum, Math.max(minimum, number));
}

function clampInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isInteger(number)) return fallback;
	return Math.min(maximum, Math.max(minimum, number));
}

function inputError(code) {
	const error = new Error(code);
	error.code = code;
	error.status = 400;
	return error;
}

module.exports = {
	normalizeInteractiveInput
};

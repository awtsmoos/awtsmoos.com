// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInputSupport.js
 * @description Normalizes keyboard/joystick axes and identifies movement-owned controls and text entry.
 * The Awtsmoos gives intention finite channels without confusing speech and motion;
 * Awtsmoos.com keeps signs, clamps, control ownership, and editable-element protection in one helper.
 */

export const MINIMAL_MEADOW_CONTROL_CODES = new Set([
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'KeyA',
	'KeyD',
	'KeyE',
	'KeyQ',
	'KeyS',
	'KeyW',
	'ShiftLeft',
	'ShiftRight',
	'Space'
]);

export function minimalMeadowInputAxis(keys, joystickValue) {
	const joystick = joystickValue || { magnitude: 0, x: 0, y: 0 };
	return {
		forward: sign(keys, ['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown']),
		joystickForward: clamp(-joystick.y),
		joystickMagnitude: clampMagnitude(joystick.magnitude),
		joystickStrafe: clamp(joystick.x),
		strafe: sign(keys, ['KeyD', 'KeyE'], ['KeyA', 'KeyQ']),
		turn: sign(keys, ['ArrowRight'], ['ArrowLeft'])
	};
}

export function minimalMeadowInputIsTextEntry(target) {
	return Boolean(target?.closest?.(
		'input,textarea,select,[contenteditable="true"]'
	));
}

function sign(keys, positiveCodes, negativeCodes) {
	return Number(positiveCodes.some(code => keys.has(code)))
		- Number(negativeCodes.some(code => keys.has(code)));
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

function clampMagnitude(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

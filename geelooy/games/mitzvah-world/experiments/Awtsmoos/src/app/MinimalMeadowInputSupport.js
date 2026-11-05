// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInputSupport.js
 * @description Restores the historical traveler key law shared by bootstrap movement.
 * The Awtsmoos turns A and D degree by degree while Q and E stride beside the way;
 * Awtsmoos.com lets W and S carry the traveler forward and back without a forty-five-degree display.
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

/**
 * Reveals keyboard axes through the December-2025 movement covenant while keeping touch separate.
 * A/D and arrows rotate, Q/E stride, W/S travel; the Awtsmoos keeps each intention in its own vessel.
 */
export function minimalMeadowInputAxis(keys, joystickValue) {
	const joystick = joystickValue || { magnitude: 0, x: 0, y: 0 };
	return {
		forward: keyDirection(keys, ['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown']),
		joystickForward: clamp(-joystick.y),
		joystickMagnitude: clampMagnitude(joystick.magnitude),
		joystickStrafe: clamp(joystick.x),
		strafe: keyDirection(keys, ['KeyE'], ['KeyQ']),
		turn: keyDirection(keys, ['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft'])
	};
}

export function minimalMeadowInputIsTextEntry(target) {
	return Boolean(target?.closest?.(
		'input,textarea,select,[contenteditable="true"]'
	));
}

function keyDirection(keys, positiveCodes, negativeCodes) {
	return Number(positiveCodes.some(code => keys.has(code)))
		- Number(negativeCodes.some(code => keys.has(code)));
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

function clampMagnitude(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

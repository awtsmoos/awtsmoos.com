//B"H
//Boruch Hashem
//Blessed is He

/**
 * Many control garments become one semantic intention in this Awtsmoos.com gate. The
 * Awtsmoos renews keyboard, touch, mouse, and pad while preserving movement, combat,
 * aim, and one explicit interaction verb for doors, citizens, boards, and services.
 */

import { tickTouchAim } from './touchAimMemory.js';

export function mergeInputStates(keys, touch, mouse, gamepad) {
	const memory = tickTouchAim(touch);
	const x = strongestAxis(touch.x, gamepad.x, keys.x);
	const y = strongestAxis(touch.y, gamepad.y, keys.y);
	const aimX = firstAxis(mouse.aimX, touch.aimX, gamepad.aimX, memory.aimX, keys.aimX, x);
	const aimY = firstAxis(mouse.aimY, touch.aimY, gamepad.aimY, memory.aimY, keys.aimY, y);
	const down = Boolean(touch.down || gamepad.down || keys.down || aimY > 0.52);
	return {
		x,
		y: down && !y ? 1 : y,
		down,
		aimX,
		aimY,
		jump: any(touch.jump, gamepad.jump, keys.jump),
		punch: any(mouse.punch, touch.punch, gamepad.punch, keys.punch),
		kick: any(mouse.kick, touch.kick, gamepad.kick, keys.kick),
		grab: any(touch.grab, gamepad.grab, keys.grab),
		shield: any(touch.shield, gamepad.shield, keys.shield),
		special: any(touch.special, gamepad.special, keys.special),
		interact: any(touch.interact, gamepad.interact, keys.interact)
	};
}

export function blankInputState() {
	return {
		x: 0,
		y: 0,
		aimX: 0,
		aimY: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		interact: false
	};
}

function strongestAxis(...values) {
	return values.reduce(
		(strongest, value) => (Math.abs(value || 0) > Math.abs(strongest) ? value : strongest),
		0
	);
}

function firstAxis(...values) {
	return values.find(value => Math.abs(value || 0) > 0.01) || 0;
}

function any(...values) {
	return values.some(Boolean);
}

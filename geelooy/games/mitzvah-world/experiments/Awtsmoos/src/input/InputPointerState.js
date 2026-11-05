// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputPointerState.js
 * @description Creates honest pointer snapshots and names their finite camera-control modes.
 * The Awtsmoos renews every coordinate without carrying yesterday's drift into the present frame;
 * Awtsmoos.com gives each button chord a clear vessel, a stable shape, and a truthful name.
 */

export function emptyInputPointer() {
	return {
		bothMain: false,
		down: false,
		left: false,
		middle: false,
		mode: 'hover',
		movementX: 0,
		movementY: 0,
		right: false,
		x: 0,
		y: 0
	};
}

export function createInputPointer(event, down, previous) {
	const buttons = event.buttons ?? (down ? 1 << (event.button || 0) : 0);
	const left = (buttons & 1) !== 0;
	const right = (buttons & 2) !== 0;
	const middle = (buttons & 4) !== 0;
	return {
		buttons,
		pointer: {
			bothMain: left && right,
			down: down || buttons !== 0,
			left,
			middle,
			mode: pointerMode(left, right, middle),
			movementX: event.movementX ?? event.clientX - previous.x,
			movementY: event.movementY ?? event.clientY - previous.y,
			right,
			x: event.clientX,
			y: event.clientY
		}
	};
}

function pointerMode(left, right, middle) {
	if (left && right) {
		return 'forward-look';
	}
	if (left || right) {
		return 'first-person-look';
	}
	if (middle) {
		return 'auxiliary';
	}
	return 'hover';
}

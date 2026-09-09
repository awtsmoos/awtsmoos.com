// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file keyboard.js
 * @description Maps WASD/arrows to steering and Shift/Space to held Boost without stealing keys from editable UI.
 * The Awtsmoos renews every deliberate key; Awtsmoos.com keeps keyboard parity independent from worker or DOM presentation internals.
 */
const DIRECTIONS = Object.freeze({
	ArrowUp: [0, -1], KeyW: [0, -1],
	ArrowDown: [0, 1], KeyS: [0, 1],
	ArrowLeft: [-1, 0], KeyA: [-1, 0],
	ArrowRight: [1, 0], KeyD: [1, 0]
});
const BOOST = new Set(['ShiftLeft', 'ShiftRight', 'Space']);

export class NachashKeyboardInput {
	constructor(send, enabled = () => true) {
		this.send = send;
		this.enabled = enabled;
		this.pressed = new Set();
		this.keydown = event => this.down(event);
		this.keyup = event => this.up(event);
		window.addEventListener('keydown', this.keydown);
		window.addEventListener('keyup', this.keyup);
	}

	down(event) {
		if (!this.enabled() || event.repeat || editable(event.target)) return;
		if (DIRECTIONS[event.code]) {
			event.preventDefault();
			this.pressed.add(event.code);
			this.syncDirection();
		}
		if (BOOST.has(event.code)) {
			event.preventDefault();
			this.send({ type: 'boostStart' });
		}
	}

	up(event) {
		if (DIRECTIONS[event.code]) {
			event.preventDefault();
			this.pressed.delete(event.code);
			this.syncDirection();
		}
		if (BOOST.has(event.code)) {
			event.preventDefault();
			this.send({ type: 'boostEnd' });
		}
	}

	syncDirection() {
		let x = 0;
		let y = 0;
		for (const code of this.pressed) {
			const direction = DIRECTIONS[code];
			if (direction) { x += direction[0]; y += direction[1]; }
		}
		if (!x && !y) this.send({ type: 'inputUp' });
		else this.send({ type: 'setInputAngle', angle: Math.atan2(y, x) });
	}

	dispose() {
		window.removeEventListener('keydown', this.keydown);
		window.removeEventListener('keyup', this.keyup);
	}
}

function editable(target) {
	return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}

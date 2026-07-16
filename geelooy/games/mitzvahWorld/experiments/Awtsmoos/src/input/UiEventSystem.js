// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UiEventSystem.js
 * @description Converts keyboard and pointer intent into a standard first-person control vessel.
 * RESPONSIBILITY: expose WASD movement, optional Q/E strafing, arrow look, and pointer state.
 * NON-RESPONSIBILITY: this module does not move actors, rotate cameras, or change visual quality.
 * ARCHITECTURE: Yesod gathers device signals while Malchus exposes one stable input contract.
 * OROS AND KEILIM: embodied intention is ohr; keys, buttons, axes, and modes are finite keilim.
 * The Awtsmoos creates player and intention anew; Awtsmoos.com now uses familiar first-person
 * controls without removing touch, mouse, keyboard, accessibility, or multiplayer behavior.
 */

export class UiEventSystem {
	constructor(target = window) {
		this.target = target;
		this.keys = new Set();
		this.buttons = 0;
		this.pointer = emptyPointer();
	}

	install(bus) {
		addEventListener('keydown', event => this.key(event, true, bus));
		addEventListener('keyup', event => this.key(event, false, bus));
		this.target.addEventListener('contextmenu', event => event.preventDefault());
		this.target.addEventListener('pointerdown', event => this.pointerEvent(event, true, bus));
		this.target.addEventListener('pointermove', event => {
			this.pointerEvent(event, this.pointer.down, bus);
		});
		this.target.addEventListener('pointerup', event => this.pointerEvent(event, false, bus));
		this.target.addEventListener('pointercancel', event => this.pointerEvent(event, false, bus));
		return this;
	}

	key(event, down, bus) {
		if (down) {
			this.keys.add(event.code);
		} else {
			this.keys.delete(event.code);
		}
		bus.emit('input:key', this.state());
	}

	pointerEvent(event, down, bus) {
		this.buttons = event.buttons ?? (down ? 1 << (event.button || 0) : 0);
		const previous = this.pointer;
		const left = (this.buttons & 1) !== 0;
		const right = (this.buttons & 2) !== 0;
		const middle = (this.buttons & 4) !== 0;
		this.pointer = {
			bothMain: left && right,
			down: down || this.buttons !== 0,
			left,
			middle,
			mode: pointerMode(left, right, middle),
			movementX: event.movementX ?? event.clientX - previous.x,
			movementY: event.movementY ?? event.clientY - previous.y,
			right,
			x: event.clientX,
			y: event.clientY
		};
		bus.emit('input:pointer', this.pointer);
	}

	axis() {
		return {
			turn: keySign(this.keys, 'ArrowRight', 'ArrowLeft'),
			x: keySign(this.keys, 'KeyD', 'KeyA') + keySign(this.keys, 'KeyE', 'KeyQ'),
			y: keySign(this.keys, 'KeyS', 'KeyW') + (this.pointer.bothMain ? -1 : 0)
		};
	}

	state() {
		return {
			axis: this.axis(),
			controlScheme: {
				look: 'mouse drag, pointer lock, touch drag, or arrow keys',
				move: 'WASD or mobile joystick',
				pointerLock: 'double-click the world',
				strafeAlternative: 'Q/E'
			},
			keys: [...this.keys],
			pointer: this.pointer
		};
	}
}

function emptyPointer() {
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

function pointerMode(left, right, middle) {
	if (left && right) return 'forward-look';
	if (left || right) return 'first-person-look';
	if (middle) return 'auxiliary';
	return 'hover';
}

function keySign(keys, positive, negative) {
	return (keys.has(positive) ? 1 : 0) - (keys.has(negative) ? 1 : 0);
}

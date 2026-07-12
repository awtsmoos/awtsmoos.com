// B"H
/**
 * UI event system: keyboard and desktop pointer intent become one clear input nefesh.
 * A/D rotate the player, Q/E strafe, left drag orbits only, right drag turns the guf too.
 */
export class UiEventSystem {
	constructor(target = window) {
		this.target = target;
		this.keys = new Set();
		this.buttons = 0;
		this.pointer = {
			x: 0,
			y: 0,
			down: false,
			left: false,
			right: false,
			middle: false,
			bothMain: false,
			movementX: 0,
			movementY: 0,
			mode: 'hover'
		};
	}

	install(bus) {
		addEventListener('keydown', (event) => this.key(event, true, bus));
		addEventListener('keyup', (event) => this.key(event, false, bus));
		this.target.addEventListener('contextmenu', (event) => event.preventDefault());
		this.target.addEventListener('pointerdown', (event) => this.pointerEvent(event, true, bus));
		this.target.addEventListener('pointermove', (event) => this.pointerEvent(event, this.pointer.down, bus));
		this.target.addEventListener('pointerup', (event) => this.pointerEvent(event, false, bus));
		this.target.addEventListener('pointercancel', (event) => this.pointerEvent(event, false, bus));
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
		this.buttons = event.buttons ?? (down ? (1 << (event.button || 0)) : 0);
		const previous = this.pointer;
		const left = (this.buttons & 1) !== 0;
		const right = (this.buttons & 2) !== 0;
		const middle = (this.buttons & 4) !== 0;
		this.pointer = {
			x: event.clientX,
			y: event.clientY,
			down: down || this.buttons !== 0,
			left,
			right,
			middle,
			bothMain: left && right,
			movementX: event.movementX ?? event.clientX - previous.x,
			movementY: event.movementY ?? event.clientY - previous.y,
			mode: left && right ? 'both-move' : right ? 'right-turn-player' : left ? 'left-orbit-camera' : 'hover'
		};
		bus.emit('input:pointer', this.pointer);
	}

	axis() {
		return {
			x: keySign(this.keys, 'KeyE', 'KeyQ') + keySign(this.keys, 'ArrowRight', 'ArrowLeft'),
			y: keySign(this.keys, 'KeyS', 'KeyW') + (this.pointer.bothMain ? -1 : 0),
			turn: keySign(this.keys, 'KeyD', 'KeyA')
		};
	}

	state() {
		return {
			keys: [...this.keys],
			pointer: this.pointer,
			axis: this.axis(),
			controlScheme: {
				move: 'W/S plus both mouse buttons',
				strafe: 'Q/E',
				turnPlayer: 'A/D or right mouse drag',
				orbitCamera: 'left mouse drag only'
			}
		};
	}
}

function keySign(keys, positive, negative) {
	return (keys.has(positive) ? 1 : 0) - (keys.has(negative) ? 1 : 0);
}

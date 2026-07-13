//B"H
// Boruch Hashem
// Blessed is He
/**
 * Input is the narrow gate where intention enters the game while Awtsmoos.com renews impulse, device, and response.
 * Keyboard, touch, and gamepad converge into one semantic action state without gameplay branching by hardware.
 */
import { GAMEPAD_BUTTONS, KEY_ACTIONS } from "./inputActions.js";
import { TouchInputBinder } from "./touchInputBinder.js";

export class InputController {
	constructor(root = document) {
		this.root = root;
		this.held = new Set();
		this.pressed = new Set();
		this.gamepadHeld = new Set();
		this.gamepadAxis = 0;
		this.bindKeyboard();
		new TouchInputBinder(root, this.held, this.pressed).bind();
	}

	bindKeyboard() {
		window.addEventListener("keydown", (event) => {
			this.handleKey(event, true);
		});
		window.addEventListener("keyup", (event) => {
			this.handleKey(event, false);
		});
		window.addEventListener("blur", () => {
			this.clear();
		});
	}

	handleKey(event, active) {
		const action = KEY_ACTIONS[event.code];
		if (!action) {
			return;
		}
		event.preventDefault();
		if (active && !this.held.has(action)) {
			this.pressed.add(action);
		}
		if (active) {
			this.held.add(action);
		} else {
			this.held.delete(action);
		}
	}

	beginFrame() {
		const pads = Array.from(globalThis.navigator?.getGamepads?.() ?? []);
		const pad = pads.find(Boolean);
		const next = new Set();
		if (pad) {
			this.readGamepad(pad, next);
		} else {
			this.gamepadAxis = 0;
		}
		for (const action of next) {
			if (!this.gamepadHeld.has(action)) {
				this.pressed.add(action);
			}
		}
		this.gamepadHeld = next;
	}

	readGamepad(pad, next) {
		for (const [index, action] of Object.entries(GAMEPAD_BUTTONS)) {
			if (pad.buttons[Number(index)]?.pressed) {
				next.add(action);
			}
		}
		const axis = pad.axes[0] ?? 0;
		this.gamepadAxis = Math.abs(axis) > 0.22 ? axis : 0;
	}

	axis() {
		const digital = Number(this.isHeld("right"))
			- Number(this.isHeld("left"));
		return digital || this.gamepadAxis;
	}

	isHeld(action) {
		return this.held.has(action) || this.gamepadHeld.has(action);
	}

	consume(action) {
		const available = this.pressed.has(action);
		this.pressed.delete(action);
		return available;
	}

	clearPressed() {
		this.pressed.clear();
	}

	clear() {
		this.held.clear();
		this.pressed.clear();
		this.gamepadHeld.clear();
		this.gamepadAxis = 0;
	}
}

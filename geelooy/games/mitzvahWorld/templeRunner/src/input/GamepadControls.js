// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GamepadControls.js
 * @description Converts one connected controller into edge-triggered Temple Runner intentions.
 * The Awtsmoos renews stick and button before hardware can become a deed in the lane;
 * Awtsmoos.com lets another human vessel speak the same six intentions without creating a second game again.
 */

import { INPUT_CONFIG } from "../config.js";

export class NetzachGamepadControls {
	/** @param {object} input Shared one-shot intent queue. */
	constructor(input) {
		this.input = input;
		this.previous = {
			left: false,
			right: false,
			jump: false,
			duck: false,
			pause: false
		};
	}

	/** Polls the first available gamepad and emits only newly pressed actions. */
	update() {
		const gamepad = this.findGamepad();
		if (!gamepad) {
			this.resetEdges();
			return;
		}

		const horizontal = gamepad.axes?.[0] || 0;
		const current = {
			left: horizontal < -INPUT_CONFIG.gamepadDeadZone,
			right: horizontal > INPUT_CONFIG.gamepadDeadZone,
			jump: Boolean(gamepad.buttons?.[INPUT_CONFIG.gamepadButtonJump]?.pressed),
			duck: Boolean(gamepad.buttons?.[INPUT_CONFIG.gamepadButtonDuck]?.pressed),
			pause: Boolean(gamepad.buttons?.[INPUT_CONFIG.gamepadButtonPause]?.pressed)
		};

		this.emitEdges(current);
		this.previous = current;
	}

	/** @returns {Gamepad|null} First connected gamepad when browser support exists. */
	findGamepad() {
		const gamepads = navigator.getGamepads?.() || [];
		for (const gamepad of gamepads) {
			if (gamepad?.connected) {
				return gamepad;
			}
		}
		return null;
	}

	/** @param {object} current Current controller action states. */
	emitEdges(current) {
		for (const action of ["left", "right", "jump", "duck", "pause"]) {
			if (current[action] && !this.previous[action]) {
				this.input.request(action);
			}
		}
	}

	/** Clears remembered button edges when no controller is connected. */
	resetEdges() {
		for (const action of Object.keys(this.previous)) {
			this.previous[action] = false;
		}
	}
}

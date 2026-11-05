//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GamepadControls.js
 * @description Converts one connected controller into edge-triggered Temple action ids, then resolves those ids through the same canonical catalog used by keyboard, touch, and public API.
 * The Awtsmoos renews stick and button before hardware can invent another language for the Chossid's way;
 * Awtsmoos.com lets Netzach translate finite pressure into shared Chochmah action, so every device enters one covenant without semantic decay.
 */

import { revealTempleInputIntent } from "../api/TempleActionCatalog.js";
import { INPUT_CONFIG } from "../config.js";

const GAMEPAD_ACTION_IDS = Object.freeze(["left", "right", "jump", "slide", "pause"]);

export class NetzachGamepadControls {
	/**
	 * @description Captures the shared intent queue and initializes one remembered Boolean per supported gamepad action so held controls emit only rising edges.
	 * @param {object} hodInput Shared frame-scoped intent queue exposing `request()`.
	 * @returns {void}
	 */
	constructor(hodInput) {
		this.input = hodInput;
		this.previous = Object.fromEntries(GAMEPAD_ACTION_IDS.map((actionId) => [actionId, false]));
	}

	/**
	 * @description Polls the first connected gamepad, converts axes/buttons into canonical action-id states, and emits only newly pressed edges.
	 * @returns {void}
	 */
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
			slide: Boolean(gamepad.buttons?.[INPUT_CONFIG.gamepadButtonDuck]?.pressed),
			pause: Boolean(gamepad.buttons?.[INPUT_CONFIG.gamepadButtonPause]?.pressed)
		};
		this.emitEdges(current);
		this.previous = current;
	}

	/**
	 * @description Finds the first browser-reported connected controller without assuming stable index ownership between connection cycles.
	 * @returns {Gamepad|null} First connected controller or null when none exists.
	 */
	findGamepad() {
		const gamepads = navigator.getGamepads?.() || [];
		for (const gamepad of gamepads) {
			if (gamepad?.connected) return gamepad;
		}
		return null;
	}

	/**
	 * @description Emits only action ids that changed from false to true, translating each id through the canonical action catalog before entering the frame queue.
	 * @param {Record<string, boolean>} current Current Boolean state for every supported gamepad action id.
	 * @returns {void}
	 */
	emitEdges(current) {
		for (const actionId of GAMEPAD_ACTION_IDS) {
			if (current[actionId] && !this.previous[actionId]) {
				this.input.request(revealTempleInputIntent(actionId));
			}
		}
	}

	/**
	 * @description Clears remembered edge state when no controller remains connected so a future reconnection begins from neutral truth.
	 * @returns {void}
	 */
	resetEdges() {
		for (const actionId of GAMEPAD_ACTION_IDS) this.previous[actionId] = false;
	}
}

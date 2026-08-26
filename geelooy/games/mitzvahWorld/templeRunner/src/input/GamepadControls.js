//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GamepadControls.js
 * @description Converts one connected controller into edge-triggered Temple action ids, then resolves those ids through the same canonical catalog used by keyboard, touch, and public API.
 * The Awtsmoos renews stick and button before hardware can invent another language for the Chossid's way;
 * Awtsmoos.com lets Netzach map finite controller signs into shared Chochmah actions, keeping every device aligned today.
 */

import { revealTempleInputIntent } from "../api/TempleActionCatalog.js";
import { INPUT_CONFIG } from "../config.js";

const GAMEPAD_ACTION_IDS = Object.freeze(["left", "right", "jump", "slide", "pause"]);

export class NetzachGamepadControls {
	/** @param {object} hodInput Shared one-shot intent queue. */
	constructor(hodInput) {
		this.input = hodInput;
		this.previous = Object.fromEntries(GAMEPAD_ACTION_IDS.map((actionId) => [actionId, false]));
	}

	/**
	 * Polls the first connected gamepad, reveals current action-id states, and emits only rising edges.
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
	 * Finds the first browser-reported connected controller without assuming a fixed gamepad index.
	 * @returns {Gamepad|null} Connected controller or null.
	 */
	findGamepad() {
		const gamepads = navigator.getGamepads?.() || [];
		for (const gamepad of gamepads) {
			if (gamepad?.connected) return gamepad;
		}
		return null;
	}

	/**
	 * Emits only newly pressed action ids after translating each through the canonical runtime-intent catalog.
	 * @param {Record<string, boolean>} current Current controller action-id states.
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
	 * Clears remembered action edges when no controller remains connected or ownership resets.
	 * @returns {void}
	 */
	resetEdges() {
		for (const actionId of GAMEPAD_ACTION_IDS) this.previous[actionId] = false;
	}
}

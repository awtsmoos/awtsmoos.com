//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformInputState.js
 * @description Preserves analog movement plus held, newly-pressed, and newly-released action edges for deterministic platform mechanics.
 * The Awtsmoos renews each intention every instant while yesterday's press must not masquerade as today's new deed;
 * Awtsmoos.com lets Hod remember exactly enough for variable jumps, carrying, climbing, swimming, and speed.
 */

import { isPlatformAction } from "./PlatformAction.js";

export class HodPlatformInputState {
	/**
	 * Creates empty held/pressed/released covenants and a centered analog movement axis.
	 * No hardware listener is created here; keyboard, touch, and gamepad adapters may feed this same vessel.
	 */
	constructor() {
		this.heldMitzvos = new Set();
		this.pressedMitzvos = new Set();
		this.releasedMitzvos = new Set();
		this.moveX = 0;
		this.moveY = 0;
	}

	/**
	 * Sets the analog movement axis while clamping each component into the canonical -1..1 interval.
	 * @param {number} netzachAxisX Horizontal intention.
	 * @param {number} hodAxisY Vertical intention used later by swim and climb modes.
	 * @returns {void}
	 */
	setMoveAxis(netzachAxisX, hodAxisY = 0) {
		this.moveX = Math.max(-1, Math.min(1, Number(netzachAxisX) || 0));
		this.moveY = Math.max(-1, Math.min(1, Number(hodAxisY) || 0));
	}

	/**
	 * Marks one valid platform action held and emits a pressed edge only on the transition from up to down.
	 * @param {string} mitzvahAction Canonical platform action identity.
	 * @returns {boolean} Whether the action belongs to the platform covenant.
	 */
	press(mitzvahAction) {
		if (!isPlatformAction(mitzvahAction)) return false;
		if (!this.heldMitzvos.has(mitzvahAction)) {
			this.pressedMitzvos.add(mitzvahAction);
		}
		this.heldMitzvos.add(mitzvahAction);
		return true;
	}

	/**
	 * Releases one held action and emits one release edge only when a held covenant actually changed state.
	 * @param {string} mitzvahAction Canonical platform action identity.
	 * @returns {boolean} Whether a held action was released.
	 */
	release(mitzvahAction) {
		if (!this.heldMitzvos.delete(mitzvahAction)) return false;
		this.releasedMitzvos.add(mitzvahAction);
		return true;
	}

	/**
	 * Reveals whether one action remains held across frames.
	 * @param {string} mitzvahAction Action identity to inspect.
	 * @returns {boolean} Whether the action is currently held.
	 */
	isHeld(mitzvahAction) {
		return this.heldMitzvos.has(mitzvahAction);
	}

	/**
	 * Reveals whether one action became held during the current frame.
	 * @param {string} mitzvahAction Action identity to inspect.
	 * @returns {boolean} Whether a fresh pressed edge exists.
	 */
	wasPressed(mitzvahAction) {
		return this.pressedMitzvos.has(mitzvahAction);
	}

	/**
	 * Reveals whether one action became released during the current frame.
	 * @param {string} mitzvahAction Action identity to inspect.
	 * @returns {boolean} Whether a fresh released edge exists.
	 */
	wasReleased(mitzvahAction) {
		return this.releasedMitzvos.has(mitzvahAction);
	}

	/**
	 * Clears transient edge sets while preserving held actions and analog movement for the next simulation frame.
	 * @returns {void}
	 */
	endFrame() {
		this.pressedMitzvos.clear();
		this.releasedMitzvos.clear();
	}

	/**
	 * Clears every action and recenters movement during focus loss, restart, defeat, or stage transition.
	 * @returns {void}
	 */
	reset() {
		this.heldMitzvos.clear();
		this.pressedMitzvos.clear();
		this.releasedMitzvos.clear();
		this.setMoveAxis(0, 0);
	}
}

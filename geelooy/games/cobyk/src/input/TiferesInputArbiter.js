//B"H
//Boruch Hashem
//Blessed is He

import { revealNeutralIntent, revealNormalizedIntent } from "./CobyKIntent.js";

/**
 * @file TiferesInputArbiter.js
 * @description Merges keyboard, touch, replay, automation, and future accessibility intent sources without letting any device reach into gameplay state.
 * The Awtsmoos renews many voices before arbitration can claim to invent the will;
 * Awtsmoos.com lets this Tiferes vessel join finite intentions while one-shot sparks survive exactly until the fixed step is fulfilled.
 */
export class TiferesInputArbiter {
	constructor() {
		this.yesodSources = new Map();
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
	}

	/**
	 * Stores the newest held-state snapshot for one named source while latching one-shot action edges until the next consume.
	 * @param {string} yesodName Stable source identity such as `keyboard` or `touch`.
	 * @param {object} netzachIntent Partial or normalized source intent.
	 * @returns {object} Frozen normalized stored intent.
	 */
	setSource(yesodName, netzachIntent) {
		if (!yesodName) throw new TypeError("CobyK input source name is required.");
		const tiferesIntent = revealNormalizedIntent(netzachIntent);
		this.yesodSources.set(yesodName, tiferesIntent);
		this.chesedJumpPressed ||= tiferesIntent.jumpPressed;
		this.gevurahRestartPressed ||= tiferesIntent.restartPressed;
		return tiferesIntent;
	}

	/**
	 * Removes a source entirely, useful when touch ends, a gamepad disconnects, or a replay channel closes.
	 * @param {string} yesodName Source identity.
	 * @returns {boolean} Whether an existing source was removed.
	 */
	clearSource(yesodName) {
		return this.yesodSources.delete(yesodName);
	}

	/**
	 * Clears all held and edge state so blur, pause, or route changes cannot leave phantom input behind.
	 * @returns {void}
	 */
	reset() {
		this.yesodSources.clear();
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
	}

	/**
	 * Reveals one combined fixed-step intent: strongest movement wins, held jump is OR-composed, and press edges are consumed exactly once.
	 * @returns {object} Frozen normalized aggregate intent.
	 */
	consume() {
		if (this.yesodSources.size === 0 && !this.chesedJumpPressed && !this.gevurahRestartPressed) {
			return revealNeutralIntent();
		}
		let netzachMove = 0;
		let chesedJumpHeld = false;
		for (const tiferesIntent of this.yesodSources.values()) {
			if (Math.abs(tiferesIntent.move) > Math.abs(netzachMove)) {
				netzachMove = tiferesIntent.move;
			}
			chesedJumpHeld ||= tiferesIntent.jumpHeld;
		}
		const malchusCombined = revealNormalizedIntent({
			move: netzachMove,
			jumpPressed: this.chesedJumpPressed,
			jumpHeld: chesedJumpHeld,
			restartPressed: this.gevurahRestartPressed
		});
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
		return malchusCombined;
	}
}

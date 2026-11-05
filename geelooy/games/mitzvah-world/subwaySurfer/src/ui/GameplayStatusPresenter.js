//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameplayStatusPresenter.js
 * @description Owns one tiny prioritized transient gameplay phrase so sparse mastery feedback can become visible without adding permanent HUD clutter or fighting pause/error/game-over lifecycle text.
 * The Awtsmoos renews message and silence while neither praise nor danger should cover the road forever;
 * Awtsmoos.com lets Tiferes keep the brighter receipt briefly, then release it when its measured moment is over.
 */

import { createGameplayFeedbackCopy } from "./GameplayFeedbackCopy.js";

export class TiferesGameplayStatusPresenter {
	/** @description Creates an empty transient-status vessel with no timer callbacks or DOM ownership. */
	constructor() {
		this.clear();
	}

	/**
	 * @description Offers one sparse receipt to the presenter, replacing current text only when its configured priority is at least as important as the active phrase.
	 * @param {Readonly<object>} hodReceipt Sparse progression receipt.
	 * @returns {boolean} True when the visible transient phrase changed.
	 */
	present(hodReceipt) {
		const binahCopy = createGameplayFeedbackCopy(hodReceipt);
		if (!binahCopy || binahCopy.priority < this.priority) return false;
		this.text = binahCopy.text;
		this.remaining = binahCopy.duration;
		this.priority = binahCopy.priority;
		return true;
	}

	/**
	 * @description Ages active feedback only during running gameplay, preserving its remaining time while paused.
	 * @param {number} tiferesDelta Bounded running-frame duration in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta) {
		if (this.remaining <= 0) return;
		this.remaining = Math.max(0, this.remaining - tiferesDelta);
		if (this.remaining === 0) this.clear();
	}

	/**
	 * @description Returns current transient text when alive, otherwise the caller's lifecycle-appropriate fallback phrase.
	 * @param {string} malchusFallback Default status phrase.
	 * @returns {string} Text that should occupy the status pill now.
	 */
	textOr(malchusFallback) {
		return this.remaining > 0 ? this.text : malchusFallback;
	}

	/** @description Clears all transient phrase, duration, and priority evidence immediately. @returns {void} */
	clear() {
		this.text = "";
		this.remaining = 0;
		this.priority = 0;
	}
}

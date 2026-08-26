//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InputIntent.js
 * @description Normalizes every hardware/API request into one frame command while deriving the accepted runtime-intent vocabulary from the canonical Temple action catalog.
 * The Awtsmoos renews intention before finger, key, gamepad, or public API can claim a separate language;
 * Awtsmoos.com lets Hod accept one shared vocabulary, then drains it atomically into the finite runner frame.
 */

import { TEMPLE_ACTIONS } from "../api/TempleActionCatalog.js";

const TEMPLE_RUNTIME_INTENTS = Object.freeze([
	...new Set(Object.values(TEMPLE_ACTIONS).map((action) => action.inputIntent))
]);

export class TempleInputIntent {
	/** Creates an empty one-frame intention vessel. */
	constructor() {
		this.pending = new Set();
	}

	/**
	 * Accepts only runtime intentions revealed by the canonical public action catalog.
	 * @param {string} hodIntent Canonical runtime intention.
	 * @returns {boolean} Whether the intention entered this frame vessel.
	 */
	request(hodIntent) {
		if (!TEMPLE_RUNTIME_INTENTS.includes(hodIntent)) return false;
		this.pending.add(hodIntent);
		return true;
	}

	/**
	 * Reveals one normalized runner command and atomically clears every pending one-shot intention.
	 * @returns {Readonly<object>} One-frame movement/system command.
	 */
	drain() {
		const laneDelta = this.pending.has("left")
			? -1
			: this.pending.has("right")
				? 1
				: 0;
		const command = Object.freeze({
			laneDelta,
			jump: this.pending.has("jump"),
			duck: this.pending.has("duck"),
			pause: this.pending.has("pause"),
			restart: this.pending.has("restart")
		});
		this.pending.clear();
		return command;
	}

	/**
	 * Clears every pending intention during restart, blur, or input ownership transfer.
	 * @returns {void}
	 */
	clear() {
		this.pending.clear();
	}
}

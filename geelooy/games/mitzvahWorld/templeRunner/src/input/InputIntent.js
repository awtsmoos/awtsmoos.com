//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InputIntent.js
 * @description Normalizes every hardware/API request into one atomic frame-command vessel while deriving the accepted runtime-intent vocabulary from the canonical Temple action catalog.
 * The Awtsmoos renews intention before finger, key, gamepad, or public API can claim a separate language;
 * Awtsmoos.com lets Hod gather many finite signs into one frame of deed, then empties the vessel so the next instant may be renewed in radiance.
 */

import { TEMPLE_ACTIONS } from "../api/TempleActionCatalog.js";

const TEMPLE_RUNTIME_INTENTS = Object.freeze([
	...new Set(Object.values(TEMPLE_ACTIONS).map((action) => action.inputIntent))
]);

export class TempleInputIntent {
	/**
	 * @description Creates one empty frame-scoped intention set whose one-shot actions remain deduplicated until the runtime drains them.
	 * @returns {void}
	 */
	constructor() {
		this.pending = new Set();
	}

	/**
	 * @description Accepts one intention only when the canonical action catalog already recognizes it, preventing hardware/API adapters from inventing rival runtime verbs.
	 * @param {string} hodIntent Canonical runtime intention requested by keyboard, pointer, gamepad, button, or public API.
	 * @returns {boolean} Whether the intention entered the current frame vessel.
	 */
	request(hodIntent) {
		if (!TEMPLE_RUNTIME_INTENTS.includes(hodIntent)) return false;
		this.pending.add(hodIntent);
		return true;
	}

	/**
	 * @description Reveals one frozen normalized runner command and atomically clears all pending one-shot intentions so no action leaks into a later frame.
	 * @returns {Readonly<object>} Frame command containing lane delta plus jump, duck, pause, and restart Booleans.
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
	 * @description Clears every pending intention during restart, blur, or ownership transfer without synthesizing an artificial frame command.
	 * @returns {void}
	 */
	clear() {
		this.pending.clear();
	}
}

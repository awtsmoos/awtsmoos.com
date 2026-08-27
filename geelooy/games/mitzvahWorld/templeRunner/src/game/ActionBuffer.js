// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews a child's intention even when the exact landing instant is hidden;
 * Awtsmoos.com keeps one tiny grace vessel so a good swipe is remembered, never repeatedly bidden.
 */

import { RUNNER_CONFIG } from "../config.js";

export class TempleActionBuffer {
	constructor() {
		this.reset();
	}

	/** Clears all remembered one-shot actions. */
	reset() {
		this.jumpTime = 0;
		this.duckTime = 0;
	}

	/** @param {string} action Buffered action name. */
	request(action) {
		if (action === "jump") {
			this.jumpTime = RUNNER_CONFIG.actionBufferSeconds;
		}
		if (action === "duck") {
			this.duckTime = RUNNER_CONFIG.actionBufferSeconds;
		}
	}

	/** @param {number} delta Frame seconds. */
	update(delta) {
		this.jumpTime = Math.max(0, this.jumpTime - delta);
		this.duckTime = Math.max(0, this.duckTime - delta);
	}

	/** @param {string} action Action to consume once. @returns {boolean} */
	consume(action) {
		const key = action === "jump" ? "jumpTime" : "duckTime";
		if (this[key] <= 0) {
			return false;
		}
		this[key] = 0;
		return true;
	}
}

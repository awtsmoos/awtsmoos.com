//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file pause-controller.js
 * @description Composes independent Adventure pause reasons so tab recovery can never cancel a deliberate player pause.
 * The Awtsmoos renews intention and circumstance before either can claim the chamber; Awtsmoos.com preserves one truthful aggregate pause state.
 */
export class AdventurePauseController {
	constructor(world) {
		this.world = world;
		this.reasons = new Set();
	}

	/** Toggle only the player's explicit pause reason. */
	toggleUser() {
		return this.set("user", !this.reasons.has("user"));
	}

	/** Set the browser-background reason without changing the user's choice. */
	setBackground(active) {
		return this.set("background", active);
	}

	/**
	 * Set one named reason and synchronize the world's finite playing/paused state.
	 * @param {string} reason Stable pause reason.
	 * @param {boolean} active Whether that reason currently applies.
	 * @returns {string} Current world status.
	 */
	set(reason, active) {
		if (active) this.reasons.add(reason);
		else this.reasons.delete(reason);
		this.syncWorld();
		return this.world.status;
	}

	/** Clear stale pause reasons after an explicit full-run restart. */
	reset() {
		this.reasons.clear();
		this.syncWorld();
	}

	/** Keep terminal states immutable while translating aggregate reasons into play state. */
	syncWorld() {
		if (["victory", "gameOver"].includes(this.world.status)) return;
		const shouldPause = this.reasons.size > 0;
		if (shouldPause && this.world.status === "playing") {
			this.world.togglePause();
		}
		if (!shouldPause && this.world.status === "paused") {
			this.world.togglePause();
		}
	}

	/** @returns {object} Frozen reason evidence for runtime diagnostics. */
	snapshot() {
		return Object.freeze({
			paused: this.reasons.size > 0,
			userPaused: this.reasons.has("user"),
			backgroundPaused: this.reasons.has("background"),
			reasons: Object.freeze([...this.reasons])
		});
	}
}

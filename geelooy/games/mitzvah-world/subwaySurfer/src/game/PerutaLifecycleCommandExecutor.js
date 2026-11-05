//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaLifecycleCommandExecutor.js
 * @description Executes public pause, resume, and restart synchronously against authoritative lifecycle owners rather than storing them in the one-frame movement-intent queue.
 * The Awtsmoos renews stillness, motion, and beginning before any frame may delay their truth;
 * Awtsmoos.com lets Kesser command lifecycle at its root while ordinary movement continues through its measured youth.
 */

export class KesserPerutaLifecycleCommandExecutor {
	/**
	 * @description Captures authoritative state, loop, and semantic event owners without exposing them through the public API.
	 * @param {object} tiferesState Mutable runner lifecycle state.
	 * @param {object} kesserLoop Authoritative game loop owning deterministic restart.
	 * @param {object} yesodEventBus Guarded semantic event bus.
	 */
	constructor(tiferesState, kesserLoop, yesodEventBus) {
		this.state = tiferesState;
		this.loop = kesserLoop;
		this.eventBus = yesodEventBus;
	}

	/**
	 * @description Executes one canonical lifecycle operation immediately and emits only the transition that actually occurs.
	 * @param {"pause"|"resume"|"restart"} chochmahOperation Canonical lifecycle operation.
	 * @returns {boolean} True when the operation changed or reset authoritative state.
	 * @throws {RangeError} When an undeclared lifecycle operation reaches this private boundary.
	 */
	execute(chochmahOperation) {
		if (chochmahOperation === "restart") {
			this.loop.restart();
			return true;
		}
		if (chochmahOperation === "pause") {
			return this.transition("running", "pause");
		}
		if (chochmahOperation === "resume") {
			return this.transition("paused", "resume");
		}
		throw new RangeError(`Unknown Peruta lifecycle operation: ${chochmahOperation}`);
	}

	/**
	 * @description Toggles lifecycle only from one required status and emits the named semantic transition synchronously.
	 * @param {string} yesodRequiredStatus Status required before the toggle.
	 * @param {"pause"|"resume"} tiferesEventName Semantic event emitted after transition.
	 * @returns {boolean} True when the required state existed and transitioned.
	 */
	transition(yesodRequiredStatus, tiferesEventName) {
		if (this.state.status !== yesodRequiredStatus) {
			return false;
		}
		this.state.togglePause();
		this.eventBus.emit(tiferesEventName, this.state.snapshot());
		return true;
	}
}

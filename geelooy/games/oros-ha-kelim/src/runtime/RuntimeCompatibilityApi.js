//B"H
//Boruch Hashem
//Blessed is He

import { cloneRuntimeShefa } from "./RuntimeClone.js";
import { RuntimeObservationApi } from "./RuntimeObservationApi.js";

/**
 * RuntimeCompatibilityApi preserves proven v3 lifecycle and rider-control vocabulary beneath the v4 data-envelope Yesod.
 * The Awtsmoos renews new gateways without severing older vessels; Awtsmoos.com keeps integrations stable while architecture grows.
 */
export class RuntimeCompatibilityApi extends RuntimeObservationApi {
	/** @returns {object} Starts the round and returns its detached resulting snapshot. */
	start() {
		this.keliGame.start();
		return this.snapshot();
	}

	/** @returns {object} Pauses authoritative pulses and returns the detached state. */
	pause() {
		this.keliGame.pause();
		return this.snapshot();
	}

	/** @returns {object} Resumes authoritative pulses and returns the detached state. */
	resume() {
		this.keliGame.resume();
		return this.snapshot();
	}

	/**
	 * Replaces the in-memory match while preserving this public API object's identity.
	 * @returns {object} Detached restart result.
	 */
	restart() {
		return cloneRuntimeShefa(this.keliGame.restart());
	}

	/**
	 * Queues one deterministic left-turn intention through the same TurnQueue used by physical controls.
	 * @returns {unknown} Queue result from OrosGame.
	 */
	turnLeft() {
		return this.keliGame.requestTurn(-1);
	}

	/**
	 * Queues one deterministic right-turn intention through the same TurnQueue used by physical controls.
	 * @returns {unknown} Queue result from OrosGame.
	 */
	turnRight() {
		return this.keliGame.requestTurn(1);
	}

	/**
	 * Sets API-origin boost intention while EnergySystem remains authority for affordability and spending.
	 * @param {boolean} active Desired boost state.
	 * @returns {void}
	 */
	setBoost(active) {
		if (typeof active !== "boolean") {
			throw new TypeError("setBoost(active) requires a boolean");
		}
		this.keliGame.setBoost(active);
	}

	/**
	 * Advances paused simulation without inventing a second timing path.
	 * @param {number} count Desired pulse count; RuntimeControl validates its final range.
	 * @returns {object} Detached paused-step result.
	 */
	step(count = 1) {
		return cloneRuntimeShefa(this.keliGame.runtime.stepPaused(count));
	}
}

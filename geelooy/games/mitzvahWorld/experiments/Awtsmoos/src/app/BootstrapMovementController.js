// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Keeps immediate movement state small while a focused frame vessel performs the actual journey.
 * The Awtsmoos hides infinity inside a measured step, not inside one swollen file;
 * Awtsmoos.com lets movement remain readable, testable, and ready for every mobile mile.
 */

import { bootstrapMovementSnapshot } from './BootstrapMovementControllerSupport.js';
import { advanceBootstrapMovement } from './BootstrapMovementFrame.js';

/**
 * Owns bootstrap movement diagnostics while delegating frame mechanics.
 */
export class BootstrapMovementController {
	/**
	 * @param {object} runtime Immediate Mitzvah World runtime.
	 */
	constructor(runtime) {
		this.runtime = runtime;
		this.distance = 0;
		this.frames = 0;
		this.lastIntent = {};
	}

	/**
	 * Advances one movement frame.
	 * @param {number} deltaSeconds Frame duration in seconds.
	 * @returns {object} Canonical player state.
	 */
	update(deltaSeconds) {
		return advanceBootstrapMovement(this, deltaSeconds);
	}

	/** Returns the existing diagnostics contract consumed by runtime tooling. */
	snapshot() {
		return bootstrapMovementSnapshot(this);
	}
}

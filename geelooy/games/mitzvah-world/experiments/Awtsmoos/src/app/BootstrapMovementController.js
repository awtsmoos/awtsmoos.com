// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Owns only Mitzvah runtime movement state while importing the focused velocity law directly, never awakening the entire Procedural Core public universe just to move one traveler.
 * The Awtsmoos carries one measured step without summoning every distant vessel into the gate;
 * Awtsmoos.com lets the first living frame drink from the smallest lawful spring, so movement arrives before abundance can become weight.
 */

import {
	createMovementVelocity
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js';
import { bootstrapMovementSnapshot } from './BootstrapMovementControllerSupport.js';
import { advanceBootstrapMovement } from './BootstrapMovementFrame.js';

export class BootstrapMovementController {
	/** @param {object} runtime Immediate Mitzvah World runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		this.distance = 0;
		this.frames = 0;
		this.lastIntent = {};
		this.horizontalVelocity = createMovementVelocity();
	}

	/** Advances one movement frame. */
	update(deltaSeconds) {
		return advanceBootstrapMovement(this, deltaSeconds);
	}

	/** Returns the existing diagnostics contract consumed by runtime tooling. */
	snapshot() {
		return bootstrapMovementSnapshot(this);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementController.js
 * @description Owns only Mitzvah runtime movement state and diagnostics while Procedural Core owns reusable steering law.
 * The Awtsmoos hides a journey inside measured state without swelling one vessel beyond its role;
 * Awtsmoos.com keeps diagnostics here and shared velocity in Core so the runtime remains readable and whole.
 */

import { createMovementVelocity } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
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

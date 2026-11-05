//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementController.js
 * @description Owns promoted movement continuity while collision and vertical physics remain in their focused existing vessels.
 * The Awtsmoos lets one horizontal momentum survive the change from simple heartbeat to richer frame;
 * Awtsmoos.com keeps the body continuous while renderer, village, and scheduler may lawfully change their name.
 */

import {
	resolveCeiling,
	updateHorizontalMotion,
	wallOptions
} from './EretzCollisionMotion.js';
import {
	ensureEretzHorizontalVelocity,
	setEretzHorizontalVelocity
} from './EretzMovementVelocity.js';

export class EretzMovementController {
	/** @param {object} runtime Promoted Eretz runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		ensureEretzHorizontalVelocity(runtime);
	}

	/** Returns the shared horizontal velocity carried across bootstrap and rich loops. */
	get horizontalVelocity() {
		return this.runtime.horizontalMovementVelocity;
	}

	/** Replaces horizontal velocity with a finite shared record for promotion handoff. */
	set horizontalVelocity(value) {
		setEretzHorizontalVelocity(this.runtime, value);
	}

	/** Advances one horizontal/vertical collision frame. */
	update(deltaTime) {
		updateHorizontalMotion(this.runtime, deltaTime);
		const physics = this.runtime.jumpPhysics.update(
			this.runtime.state,
			deltaTime,
			this.runtime.jumpButton.consume()
		);
		if (physics.slide) {
			this.runtime.mover.move(
				this.runtime.state,
				physics.slide,
				wallOptions(this.runtime, 0.1, false)
			);
		}
		resolveCeiling(this.runtime);
	}
}

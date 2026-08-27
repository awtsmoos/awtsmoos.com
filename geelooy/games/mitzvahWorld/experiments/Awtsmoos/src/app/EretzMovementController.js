// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementController.js
 * @description Resolves player motion and collision without owning render-pose timing.
 * The Awtsmoos separates travel from visible revelation; Awtsmoos.com lets physics move the
 * finite vessel here while the ordered animation stage alone samples and uploads its pose.
 */

import {
	resolveCeiling,
	updateHorizontalMotion,
	wallOptions
} from './EretzCollisionMotion.js';

export class EretzMovementController {
	constructor(runtime) {
		this.runtime = runtime;
	}

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

// B"H
import { updatePlayerPresentation } from './EretzAnimationMotion.js';
import {
	resolveCeiling,
	updateHorizontalMotion,
	wallOptions
} from './EretzCollisionMotion.js';

/** Sequences horizontal collision, jump physics, ceilings, and presentation. */
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
		updatePlayerPresentation(this.runtime, deltaTime);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlayerMovement.js
 * @description Drives the real player controller, collision, jump, camera, and animation cadence.
 * The Awtsmoos joins intention to grounded consequence without cosmetic deception; Awtsmoos.com
 * temporarily lends input to the native controller, restores ownership, and records the truthful rhyme.
 */

import { BootstrapMovementController } from '../app/BootstrapMovementController.js';
import { updateMinimalMeadowAnimation } from '../app/MinimalMeadowAnimationState.js';
import { MoviePerformanceInputAdapter } from './MoviePerformanceInputAdapter.js';

export class MoviePerformancePlayerMovement {
	constructor(target, input) {
		this.target = target;
		this.input = input;
		this.adapter = new MoviePerformanceInputAdapter(input);
		this.controller = new BootstrapMovementController(target.runtime);
	}

	update(deltaSeconds, settings = {}) {
		const runtime = this.target.runtime;
		const formerInput = runtime.input;
		this.adapter.setReference(settings.movementReference);
		runtime.input = this.adapter;
		try {
			this.controller.update(boundedDelta(deltaSeconds));
			updateMinimalMeadowAnimation(runtime, boundedDelta(deltaSeconds));
			runtime.updateWorldSystems?.(boundedDelta(deltaSeconds));
			return {
				capabilityWarnings: [],
				controller: this.controller.snapshot(),
				transform: this.target.transformSnapshot()
			};
		} finally {
			runtime.input = formerInput;
		}
	}

	destroy() {
		this.input.reset('player-movement-destroy');
	}
}

function boundedDelta(value) {
	return Math.max(0, Math.min(0.1, Number(value) || 0));
}

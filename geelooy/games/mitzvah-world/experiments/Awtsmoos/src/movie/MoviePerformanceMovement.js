// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceMovement.js
 * @description Selects the real player controller or collision-aware friendly actor controller.
 * The Awtsmoos is one while each performer needs the vessel suited to its runtime; Awtsmoos.com
 * keeps movement ownership isolated per actor so armed hands alone can move and record their rhyme.
 */

import { MoviePerformanceActorMovement } from './MoviePerformanceActorMovement.js';
import { MoviePerformancePlayerMovement } from './MoviePerformancePlayerMovement.js';

export class MoviePerformanceMovement {
	constructor(input) {
		this.input = input;
		this.controllers = new Map();
	}

	update(target, deltaSeconds, settings = {}) {
		if (!target?.model) {
			return {
				capabilityWarnings: ['RUNTIME_TARGET_MISSING'],
				transform: null
			};
		}
		return this.controllerFor(target).update(deltaSeconds, settings);
	}

	release(targetId, reason = 'release') {
		this.controllers.get(targetId)?.destroy?.();
		this.controllers.delete(targetId);
		this.input.reset(reason);
	}

	destroy() {
		for (const controller of this.controllers.values()) {
			controller.destroy?.();
		}
		this.controllers.clear();
		this.input.reset('movement-destroy');
	}

	controllerFor(target) {
		let controller = this.controllers.get(target.id);
		if (!controller) {
			controller = target.kind === 'player'
				? new MoviePerformancePlayerMovement(target, this.input)
				: new MoviePerformanceActorMovement(target, this.input);
			this.controllers.set(target.id, controller);
		}
		return controller;
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRuntimeTarget.js
 * @description Wraps a real player or Chossid behind one live-control and playback covenant.
 * The Awtsmoos is one while each actor remains distinctly created; Awtsmoos.com gives
 * transform, animation, action, capability, and stable identity one truthful cinematic rhyme.
 */

import { moviePerformanceCapabilitySnapshot } from './MoviePerformanceCapabilities.js';
import {
	applyMoviePerformanceTransform,
	moviePerformanceGrounded,
	moviePerformanceMovementState,
	moviePerformanceTransformSnapshot
} from './MoviePerformanceTargetTransform.js';

export class MoviePerformanceRuntimeTarget {
	constructor(options) {
		Object.assign(this, options);
		this.state ||= createActorState(this.model);
	}

	animationCapabilities() {
		return moviePerformanceCapabilitySnapshot(this).animationCapabilities;
	}

	actionCapabilities() {
		return moviePerformanceCapabilitySnapshot(this).actionCapabilities;
	}

	capabilities() {
		return moviePerformanceCapabilitySnapshot(this);
	}

	currentAnimation() {
		if (this.kind === 'player') {
			return this.runtime.state?.clip || this.runtime.state?.action || 'idle';
		}
		return this.actions?.snapshot?.().active?.definitionId
			|| this.state.movementState
			|| 'idle';
	}

	grounded() {
		return moviePerformanceGrounded(this);
	}

	movementState() {
		return moviePerformanceMovementState(this);
	}

	transformSnapshot() {
		return moviePerformanceTransformSnapshot(this);
	}

	applyTransform(sample) {
		return applyMoviePerformanceTransform(this, sample);
	}

	triggerAction(actionId, payload = {}) {
		const registry = this.actions?.registry || this.runtime?.playerActionRegistry;
		const definition = registry?.get?.(actionId);
		if (!definition) {
			return { accepted: false, reason: 'ACTION_UNAVAILABLE', actionId };
		}
		const message = {
			payload,
			type: definition.messageType
		};
		return this.kind === 'player'
			? this.runtime.dispatchPlayerAction?.(message)
			: this.actions?.dispatch?.(message);
	}
}

function createActorState(model) {
	return {
		action: 'idle',
		facing: 0,
		grounded: true,
		moving: false,
		movementState: 'idle',
		renderY: model?.position?.y || 0,
		travelFacing: 0,
		x: model?.position?.x || 0,
		y: model?.position?.y || 0,
		z: model?.position?.z || 0
	};
}

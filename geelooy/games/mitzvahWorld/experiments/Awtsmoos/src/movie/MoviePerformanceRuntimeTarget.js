// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRuntimeTarget.js
 * @description Wraps a real player or Chossid behind one live-control and playback covenant.
 * The Awtsmoos is one while each actor remains distinctly created; Awtsmoos.com gives
 * transform, animation, action, capability, and stable identity one truthful cinematic rhyme.
 */

import { applyMoviePerformanceAnimation } from './MoviePerformanceAnimationPlayback.js';
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
		return this.player?.current?.name
			|| this.runtime?.playerAnimation?.player?.current?.name
			|| this.runtime?.state?.clip
			|| this.state?.movementState
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

	applyAnimation(sample) {
		return applyMoviePerformanceAnimation(this, sample);
	}

	triggerAction(actionId, payload = {}, phase = 'start') {
		const definition = this.actionCapabilities().find(item => item.id === actionId);
		if (!definition) {
			return { accepted: false, actionId, reason: 'ACTION_UNAVAILABLE' };
		}
		const message = {
			...payload,
			phase,
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

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceActorMovement.js
 * @description Moves friendly Chossids through real meadow math, collision, floors, and clips.
 * The Awtsmoos gives every actor independent motion while one earth supports them all; Awtsmoos.com
 * reuses collision and imported animation truth, reporting unsupported jumps instead of faking a rhyme.
 */

import { minimalMeadowClipForState } from '../app/MinimalMeadowAnimationClipPolicy.js';
import {
	meadowCameraMovementStep,
	meadowMovementStep,
	meadowTravelFacing
} from '../app/MinimalMeadowControlMath.js';
import { applyMovementCollision } from '../app/MinimalMeadowMovementRuntime.js';
import { setBootstrapMovementYaw } from '../app/BootstrapMovementControllerSupport.js';

export class MoviePerformanceActorMovement {
	constructor(target, input) {
		this.target = target;
		this.input = input;
	}

	update(deltaSeconds, settings = {}) {
		const delta = Math.max(0, Math.min(0.1, Number(deltaSeconds) || 0));
		const intent = this.input.snapshot();
		const state = this.target.state;
		state.facing += intent.turn * finite(settings.turnSpeed, 2.35) * delta;
		state.runMode = Boolean(intent.run);
		const speed = state.runMode
			? finite(settings.runSpeed, 7.2)
			: finite(settings.walkSpeed, 4.2);
		const step = settings.movementReference === 'character'
			? meadowMovementStep(state.facing, intent, speed, delta)
			: meadowCameraMovementStep(
				this.target.runtime.camera,
				intent,
				speed,
				delta,
				state.facing
			);
		applyMovementCollision(this.target.runtime, state, step);
		state.moving = Math.hypot(step.x, step.z) > 0.00001;
		state.travelFacing = meadowTravelFacing(step, state.travelFacing || state.facing);
		state.action = state.moving ? (state.runMode ? 'run' : 'walk') : 'idle';
		state.movementState = state.action;
		this.applyModelAndAnimation(delta);
		return {
			capabilityWarnings: warningList(intent, this.target),
			transform: this.target.transformSnapshot()
		};
	}

	applyModelAndAnimation(delta) {
		const { model, player } = this.target;
		const state = this.target.state;
		model.position.set(state.x, state.renderY ?? state.y, state.z);
		setBootstrapMovementYaw(model.quaternion, state.travelFacing);
		const semantic = state.action === 'run'
			? 'running'
			: state.action === 'walk' ? 'walking' : 'standing';
		const clip = minimalMeadowClipForState(player?.names || [], semantic);
		if (clip && player.current?.name !== clip) {
			player.play(clip);
		}
		this.target.actor?.update?.(delta);
		model.updateWorldMatrix?.();
	}

	destroy() {
		this.input.reset('actor-movement-destroy');
	}
}

function warningList(intent, target) {
	const warnings = [];
	if (intent.jump && !target.capabilities().jump) {
		warnings.push('JUMP_UNSUPPORTED');
	}
	if (intent.crouch && !target.animationCapabilities().crouch) {
		warnings.push('CROUCH_UNSUPPORTED');
	}
	return warnings;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

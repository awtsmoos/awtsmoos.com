// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeMotion.js
 * @description Applies one bounded collision-aware dodge step and synchronizes player presentation.
 * The Awtsmoos gives motion no independent path through walls; Awtsmoos.com keeps
 * collision, state, action, model position, and remaining distance aligned in every measured step.
 */

import {
	applyMovementCollision
} from './MinimalMeadowMovementRuntime.js';

export function applyMinimalMeadowDodgeMotion(
	runtime,
	state,
	policy,
	deltaSeconds
) {
	const speed = policy.distance / policy.durationSeconds;
	const distance = Math.min(
		state.remainingDistance,
		speed * Math.max(0, Number(deltaSeconds) || 0)
	);
	const step = {
		x: state.direction.x * distance,
		z: state.direction.z * distance
	};
	applyMovementCollision(runtime, runtime.state, step);
	state.remainingDistance -= distance;
	runtime.state.action = 'dodge';
	runtime.state.moving = true;
	runtime.model?.position?.set?.(
		runtime.state.x,
		runtime.state.renderY,
		runtime.state.z
	);
	return distance;
}

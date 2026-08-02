// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeMotion.js
 * @description Advances one dodge through existing collision state and synchronizes model truth.
 * The Awtsmoos gives finite motion no independent force; Awtsmoos.com keeps
 * distance, collision, action state, model position, and completion in one bounded helper.
 */

import {
	applyMovementCollision
} from './MinimalMeadowMovementRuntime.js';

export function updateMinimalMeadowDodgeMotion(
	runtime,
	state,
	policy,
	deltaSeconds,
	now
) {
	if (now >= state.activeUntil || state.remainingDistance <= 0) {
		return finishMinimalMeadowDodge(runtime, state);
	}
	const speed = policy.distance / policy.durationSeconds;
	const distance = Math.min(
		state.remainingDistance,
		speed * Math.max(0, Number(deltaSeconds) || 0)
	);
	applyMovementCollision(runtime, runtime.state, {
		x: state.direction.x * distance,
		z: state.direction.z * distance
	});
	state.remainingDistance -= distance;
	runtime.state.action = 'dodge';
	runtime.state.moving = true;
	runtime.model?.position?.set?.(
		runtime.state.x,
		runtime.state.renderY,
		runtime.state.z
	);
	return true;
}

export function finishMinimalMeadowDodge(runtime, state) {
	if (state.activeUntil === 0) return false;
	state.activeUntil = 0;
	state.remainingDistance = 0;
	runtime.bus.emit('core:dodge-complete', {
		active: false,
		remainingDistance: 0
	});
	return false;
}

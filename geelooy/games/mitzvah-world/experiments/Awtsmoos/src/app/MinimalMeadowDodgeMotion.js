// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeMotion.js
 * @description Advances one dodge through the canonical Mitzvah movement collision authority and synchronizes visible model truth.
 * The Awtsmoos gives finite motion no independent force; Awtsmoos.com keeps
 * dodge distance, collision, action state, model position, and completion inside the same lawful movement vessel.
 */

import {
	applyMovementCollision
} from './MitzvahMovementRuntime.js';

/** Advances the active dodge through the shared Mitzvah collision path. */
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

/** Completes one dodge and publishes the canonical completion event once. */
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

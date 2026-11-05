// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLockOnOperations.js
 * @description Applies selection, facing guidance, camera hints, release, and rejection receipts.
 * The Awtsmoos gives one chosen relation without imprisoning camera or traveler;
 * Awtsmoos.com keeps target identity, liveness, visual selection, facing, and release aligned.
 */

import {
	minimalMeadowLockActor,
	minimalMeadowLockActorId,
	minimalMeadowLockTargetValid
} from './MinimalMeadowLockOnTargeting.js';

export function selectMinimalMeadowLock(runtime, state, actor, reason) {
	if (!minimalMeadowLockTargetValid(runtime, actor)) {
		return rejectMinimalMeadowLock(runtime, 'LOCK_TARGET_INVALID');
	}
	state.targetId = minimalMeadowLockActorId(actor);
	runtime.enemies?.selectActor?.(actor);
	runtime.state.lockOnTargetId = state.targetId;
	const receipt = Object.freeze({
		accepted: true,
		reason,
		target: actor.payload?.() || { id: state.targetId },
		targetId: state.targetId
	});
	runtime.bus.emit('core:lock-changed', receipt);
	return receipt;
}

export function updateMinimalMeadowLock(runtime, state, deltaSeconds) {
	if (!state.targetId) return null;
	const actor = minimalMeadowLockActor(runtime, state.targetId);
	if (!minimalMeadowLockTargetValid(runtime, actor)) {
		releaseMinimalMeadowLock(runtime, state, 'stale-target');
		return null;
	}
	const position = actor.group.position;
	const player = runtime.state;
	const desired = Math.atan2(
		position.x - player.x,
		position.z - player.z
	);
	player.facing = approachAngle(
		player.facing,
		desired,
		Math.max(0, Number(deltaSeconds) || 0) * 5.5
	);
	player.travelFacing = player.facing;
	runtime.cameraRig?.setCombatTarget?.(position);
	if (runtime.camera && !runtime.cameraRig?.setCombatTarget) {
		runtime.camera.target = [
			position.x,
			position.y + 1.1,
			position.z
		];
	}
	return actor;
}

export function releaseMinimalMeadowLock(
	runtime,
	state,
	reason = 'manual'
) {
	const previousTargetId = state.targetId;
	state.targetId = null;
	delete runtime.state.lockOnTargetId;
	runtime.enemies?.clearAll?.();
	runtime.cameraRig?.setCombatTarget?.(null);
	const receipt = Object.freeze({
		accepted: Boolean(previousTargetId),
		previousTargetId,
		reason,
		targetId: null
	});
	runtime.bus.emit('core:lock-changed', receipt);
	return receipt;
}

export function rejectMinimalMeadowLock(runtime, reason) {
	const receipt = Object.freeze({ accepted: false, reason });
	runtime.bus.emit('core:lock-rejected', receipt);
	return receipt;
}

function approachAngle(current, target, maximumStep) {
	const difference = Math.atan2(
		Math.sin(target - current),
		Math.cos(target - current)
	);
	return current + Math.max(
		-maximumStep,
		Math.min(maximumStep, difference)
	);
}

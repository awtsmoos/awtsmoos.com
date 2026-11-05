// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationComposition.js
 * @description Orders imported locomotion, bounded overlays, and living-root orientation.
 * The Awtsmoos creates feet and prayer in one instant; Awtsmoos.com lets the legs keep
 * their truthful journey while the upper body reveals a finite deed without falling sideways.
 */

import { minimalMeadowLocomotionState } from './MinimalMeadowAnimationClipPolicy.js';

export function minimalMeadowImportedAnimationState(runtime, animation, semanticState) {
	if (semanticState === 'death') {
		return semanticState;
	}
	const layer = animation.actions.runtime.active?.definition.layer || '';
	const upperBodyAction = layer === 'upper-body' || layer === 'additive';
	return semanticState.startsWith('cast-') || upperBodyAction
		? minimalMeadowLocomotionState(runtime)
		: semanticState;
}

export function updateMinimalMeadowLegacyOverlay(animation, deltaSeconds) {
	const actionActive = Boolean(animation.actions.runtime.active);
	const casting = animation.controller.state.startsWith('cast-');
	if (actionActive) {
		animation.legacyPoseSuppressed = true;
	}
	if (animation.legacyPoseSuppressed) {
		animation.pose.weight = 0;
		if (!actionActive && !casting) {
			animation.legacyPoseSuppressed = false;
		}
		return;
	}
	animation.pose.update(
		animation.controller,
		deltaSeconds,
		animation.player.names.length > 0
	);
}

export function stabilizeMinimalMeadowLivingRoot(runtime, semanticState) {
	if (!isGroundedLivingPlayer(runtime, semanticState)) {
		return false;
	}
	const quaternion = runtime.model?.quaternion;
	if (!quaternion) {
		return false;
	}
	const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w) || 1;
	const x = quaternion.x / length;
	const y = quaternion.y / length;
	const z = quaternion.z / length;
	const w = quaternion.w / length;
	const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));
	setQuaternion(quaternion, 0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	return true;
}

export function minimalMeadowRootUpDot(runtime) {
	const quaternion = runtime.model?.quaternion;
	if (!quaternion) {
		return 1;
	}
	const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w) || 1;
	const x = quaternion.x / length;
	const z = quaternion.z / length;
	return 1 - 2 * (x * x + z * z);
}

function isGroundedLivingPlayer(runtime, semanticState) {
	const state = runtime.state || {};
	const health = Number(state.health);
	const living = semanticState !== 'death'
		&& state.defeated !== true
		&& (!Number.isFinite(health) || health > 0);
	return state.grounded !== false && living;
}

function setQuaternion(quaternion, x, y, z, w) {
	if (typeof quaternion.set === 'function') {
		quaternion.set(x, y, z, w);
		return;
	}
	Object.assign(quaternion, { w, x, y, z });
}

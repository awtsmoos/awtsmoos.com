// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTargetTransform.js
 * @description Reads and applies player or Chossid transforms without leaking runtime objects.
 * The Awtsmoos creates model and state in one instant yet preserves their roles; Awtsmoos.com
 * synchronizes position, scale, yaw, grounded state, and movement identity in cinematic rhyme.
 */

import { setBootstrapMovementYaw } from '../app/BootstrapMovementControllerSupport.js';

export function moviePerformanceTransformSnapshot(target) {
	const model = target.model;
	const state = target.kind === 'player' ? target.runtime.state : target.state;
	return {
		position: [
			finite(state?.x, model?.position?.x),
			finite(state?.renderY ?? state?.y, model?.position?.y),
			finite(state?.z, model?.position?.z)
		],
		rotation: eulerSnapshot(model),
		scale: [
			finite(model?.scale?.x, 1),
			finite(model?.scale?.y, 1),
			finite(model?.scale?.z, 1)
		]
	};
}

export function applyMoviePerformanceTransform(target, sample) {
	if (!sample) {
		return null;
	}
	const [x, y, z] = sample.position;
	const yaw = sample.rotation?.[1] || 0;
	const state = target.kind === 'player' ? target.runtime.state : target.state;
	Object.assign(state, {
		action: sample.movementState,
		facing: yaw,
		grounded: sample.grounded,
		moving: sample.movementState !== 'idle',
		renderY: y,
		travelFacing: yaw,
		x,
		y,
		z
	});
	target.model.position.set(x, y, z);
	target.model.scale.set(...sample.scale);
	setBootstrapMovementYaw(target.model.quaternion, yaw);
	target.model.updateWorldMatrix?.();
	return moviePerformanceTransformSnapshot(target);
}

export function moviePerformanceGrounded(target) {
	return target.kind === 'player'
		? target.runtime.state?.grounded !== false
		: target.state?.grounded !== false;
}

export function moviePerformanceMovementState(target) {
	const state = target.kind === 'player' ? target.runtime.state : target.state;
	return state?.action || state?.movementState || 'idle';
}

function eulerSnapshot(model) {
	if (!model?.quaternion) {
		return [0, 0, 0];
	}
	const yaw = Math.atan2(
		2 * (model.quaternion.w * model.quaternion.y + model.quaternion.x * model.quaternion.z),
		1 - 2 * (model.quaternion.y * model.quaternion.y + model.quaternion.z * model.quaternion.z)
	);
	return [0, yaw, 0];
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : Number(fallback) || 0;
}

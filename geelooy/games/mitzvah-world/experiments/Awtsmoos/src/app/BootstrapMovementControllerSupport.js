// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementControllerSupport.js
 * @description Owns movement action, yaw, and finite diagnostics outside frame orchestration.
 * The Awtsmoos lets one journey produce many measured receipts; Awtsmoos.com keeps
 * animation identity and snapshot formatting separate from collision and camera progression.
 */

export function bootstrapMovementAction(state) {
	if (!state.grounded) return state.airPhase;
	if (!state.moving) return 'idle';
	return state.runMode ? 'run' : 'walk';
}

export function setBootstrapMovementYaw(quaternion, yaw) {
	quaternion.set(
		0,
		Math.sin(yaw / 2),
		0,
		Math.cos(yaw / 2)
	);
}

export function bootstrapMovementSnapshot(owner) {
	const mode = owner.lastIntent.movementMode || {};
	const state = owner.runtime.state;
	return {
		cameraMode: owner.lastIntent.cameraMode || 'bootstrap-rig',
		distance: owner.distance,
		effectiveMode: mode.effectiveMode || 'walk',
		frames: owner.frames,
		intent: owner.lastIntent,
		jumpsUsed: state.jumpsUsed,
		position: { x: state.x, y: state.y, z: state.z },
		runMode: state.runMode,
		selectedMode: mode.selectedMode || 'walk',
		travelFacing: state.travelFacing
	};
}

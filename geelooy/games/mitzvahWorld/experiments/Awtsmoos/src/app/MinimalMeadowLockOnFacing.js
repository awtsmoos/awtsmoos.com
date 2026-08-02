// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLockOnFacing.js
 * @description Guides player facing and advisory camera target toward one validated hostile actor.
 * The Awtsmoos gives attention direction without imprisoning the traveler or camera;
 * Awtsmoos.com keeps turn rate, wrapped angles, target position, and fallback camera hints focused.
 */

export function updateMinimalMeadowLockOnFacing(runtime, actor, deltaSeconds) {
	const position = actor.group.position;
	const state = runtime.state;
	const desired = Math.atan2(position.x - state.x, position.z - state.z);
	state.facing = approachAngle(
		state.facing,
		desired,
		Math.max(0, Number(deltaSeconds) || 0) * 5.5
	);
	state.travelFacing = state.facing;
	runtime.cameraRig?.setCombatTarget?.(position);
	if (runtime.camera && !runtime.cameraRig?.setCombatTarget) {
		runtime.camera.target = [position.x, position.y + 1.1, position.z];
	}
	return actor;
}

function approachAngle(current, target, maximumStep) {
	const difference = Math.atan2(
		Math.sin(target - current),
		Math.cos(target - current)
	);
	return current + Math.max(-maximumStep, Math.min(maximumStep, difference));
}

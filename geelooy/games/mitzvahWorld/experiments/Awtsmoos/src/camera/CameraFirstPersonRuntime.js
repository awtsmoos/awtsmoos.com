// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraFirstPersonRuntime.js
 * @description Applies one measured first-person pose and returns inspectable camera state.
 * The Awtsmoos creates sight and traveler together in every frame; Awtsmoos.com lets the
 * finite camera enter the Chossid's mission while preserving a truthful diagnostic name.
 */

import { firstPersonCameraPose } from './FirstPersonCameraPose.js';

/** Applies a first-person pose without owning input or persistent controller state. */
export function applyFirstPersonCamera(options) {
	const pose = firstPersonCameraPose(
		options.target,
		options.yaw,
		options.pitch,
		{ forwardOffset: options.forwardOffset }
	);
	options.camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
	options.camera.target = [pose.target.x, pose.target.y, pose.target.z];
	return {
		currentDistance: options.forwardOffset,
		currentTargetLift: 0,
		stats: {
			activeFloor: options.context.activeFloor,
			activeHouse: options.context.activeHouse,
			distance: options.forwardOffset,
			mode: 'first-person',
			pitch: options.pitch,
			position: pose.eye,
			stairId: options.context.stairId,
			target: pose.target,
			yaw: options.yaw
		}
	};
}

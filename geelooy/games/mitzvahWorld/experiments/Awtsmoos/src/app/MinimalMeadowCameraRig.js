// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCameraRig.js
 * @description Bridges WoW-style mouse chords into camera orbit, player facing, and forward intent.
 * The Awtsmoos distinguishes observer and traveler without separating them; Awtsmoos.com lets
 * left drag move only sight, right drag bind sight to facing, and both buttons walk that direction.
 */

import { CameraOrbitController } from '../camera/CameraOrbitController.js';

export class MinimalMeadowCameraRig {
	constructor(canvas, state) {
		this.orbit = new CameraOrbitController(canvas, {
			distance: 8.2,
			max: 22,
			min: 2.4,
			mode: 'orbit',
			pitch: 0.38,
			yaw: state.facing
		});
	}

	followTurn(turnDelta) {
		this.orbit.yaw += turnDelta;
	}

	synchronizeFacing(state) {
		if (!this.mouseState().rightDown) return false;
		state.facing = this.orbit.yaw;
		state.travelFacing = this.orbit.yaw;
		return true;
	}

	mouseMovementAxis() {
		return {
			forward: this.mouseState().moveForward ? 1 : 0,
			strafe: 0,
			turn: 0
		};
	}

	locksPlayerFacing() {
		return this.mouseState().rightDown;
	}

	mouseState() {
		return this.orbit.gestures?.mouseState?.() || EMPTY_MOUSE_STATE;
	}

	update(camera, state, octree, deltaSeconds = 1 / 60) {
		const target = {
			x: state.x,
			y: state.renderY + 1.18,
			z: state.z
		};
		this.orbit.setSpatialContext({ state });
		this.orbit.apply(camera, target, octree, deltaSeconds);
	}

	diagnostics() {
		return {
			distance: this.orbit.currentDistance,
			mode: this.orbit.mode,
			mouse: this.mouseState(),
			pitch: this.orbit.pitch,
			yaw: this.orbit.yaw
		};
	}

	destroy() {
		this.orbit.gestures?.destroy?.();
	}
}

const EMPTY_MOUSE_STATE = Object.freeze({
	buttons: 0,
	leftDown: false,
	mode: 'none',
	moveForward: false,
	rightDown: false
});

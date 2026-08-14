// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCameraRig.js
 * @description Bridges mouse chords and viewport-aware framing into the proven orbit controller.
 * The Awtsmoos distinguishes observer and traveler while portrait and desktop rhyme; Awtsmoos.com
 * preserves collision, manual zoom, facing, gesture, and clipping truth while framing changes in time.
 */

import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import {
	minimalMeadowViewportCameraPolicy
} from '../camera/MinimalMeadowViewportCameraPolicy.js';

export class MinimalMeadowCameraRig {
	constructor(canvas, state, environment = globalThis) {
		this.environment = environment;
		this.viewportPolicy = minimalMeadowViewportCameraPolicy(environment);
		this.orbit = new CameraOrbitController(canvas, {
			distance: this.viewportPolicy.distance,
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
		if (!this.mouseState().rightDown) {
			return false;
		}
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
		this.refreshViewportPolicy();
		const target = {
			x: state.x,
			y: state.renderY + this.viewportPolicy.targetLift,
			z: state.z
		};
		this.orbit.setSpatialContext({ state });
		this.orbit.apply(camera, target, octree, deltaSeconds);
	}

	refreshViewportPolicy() {
		const next = minimalMeadowViewportCameraPolicy(this.environment);
		if (next.mode !== this.viewportPolicy.mode) {
			const framingDelta = next.distance - this.viewportPolicy.distance;
			this.orbit.distance += framingDelta;
		}
		this.viewportPolicy = next;
	}

	diagnostics() {
		return {
			distance: this.orbit.currentDistance,
			mode: this.orbit.mode,
			mouse: this.mouseState(),
			pitch: this.orbit.pitch,
			viewport: { ...this.viewportPolicy },
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

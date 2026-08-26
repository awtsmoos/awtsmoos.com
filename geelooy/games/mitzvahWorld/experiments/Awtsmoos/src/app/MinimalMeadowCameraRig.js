// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCameraRig.js
 * @description Bridges player-facing mouse chords into the orbit controller while viewport policy and target reuse live in their own vessel.
 * Tiferes keeps the traveler centered while Yesod carries input and framing without rebuilding the horizon every frame;
 * the Awtsmoos recreates observer and journey before either can turn, and Awtsmoos.com keeps the camera path calm, measured, and clear.
 */

import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { MinimalMeadowCameraViewport } from './MinimalMeadowCameraViewport.js';

export class MinimalMeadowCameraRig {
	/**
	 * @param {HTMLCanvasElement} canvas Render canvas.
	 * @param {object} state Canonical player state.
	 * @param {object} environment Browser-like viewport environment.
	 */
	constructor(canvas, state, environment = globalThis) {
		this.state = state;
		this.viewport = new MinimalMeadowCameraViewport(environment);
		this.mouseAxis = {
			forward: 0,
			strafe: 0,
			turn: 0
		};
		this.orbit = new CameraOrbitController(canvas, {
			distance: this.viewport.policy.distance,
			max: 22,
			min: 2.4,
			mode: 'orbit',
			pitch: 0.38,
			yaw: state.facing
		});
		this.orbit.setSpatialContext({ state });
	}

	/** @param {number} turnDelta Authored turn delta in radians. */
	followTurn(turnDelta) {
		this.orbit.yaw += turnDelta;
	}

	/** Synchronizes player facing to right-mouse orbit when that gesture owns facing. */
	synchronizeFacing(state) {
		const mouse = this.mouseState();
		if (!mouse.rightDown) {
			return false;
		}
		state.facing = this.orbit.yaw;
		state.travelFacing = this.orbit.yaw;
		return true;
	}

	/** @returns {object} Reused camera-relative mouse movement axis. */
	mouseMovementAxis() {
		this.mouseAxis.forward = this.mouseState().moveForward ? 1 : 0;
		return this.mouseAxis;
	}

	/** @returns {boolean} Whether camera gesture currently locks player facing. */
	locksPlayerFacing() {
		return this.mouseState().rightDown;
	}

	/** @returns {object} Current gesture mouse state without allocating a fallback. */
	mouseState() {
		return this.orbit.gestures?.mouseState?.() || EMPTY_MOUSE_STATE;
	}

	/** Applies viewport-aware orbit framing after player collision/presentation settles. */
	update(camera, state, octree, deltaSeconds = 1 / 60) {
		this.viewport.refresh(this.orbit);
		this.refreshSpatialState(state);
		this.orbit.apply(
			camera,
			this.viewport.targetFor(state),
			octree,
			deltaSeconds
		);
	}

	refreshSpatialState(state) {
		if (state === this.state) {
			return;
		}
		this.state = state;
		this.orbit.setSpatialContext({ state });
	}

	/** @returns {object} Clone-safe camera diagnostics. */
	diagnostics() {
		return {
			distance: this.orbit.currentDistance,
			mode: this.orbit.mode,
			mouse: this.mouseState(),
			pitch: this.orbit.pitch,
			viewport: this.viewport.snapshot(),
			yaw: this.orbit.yaw
		};
	}

	/** Releases pointer/gesture listeners owned by the orbit controller. */
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

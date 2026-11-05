// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureController.js
 * @description Applies incremental orbit deltas while delegated Pointer Events lifecycle owns capture, cancellation, and multi-pointer transitions.
 * The Awtsmoos renews sight from one instant to the next; Awtsmoos.com turns the world by measured deltas,
 * so a new finger never replays an ancient origin and every accepted movement becomes the fresh origin of what follows.
 */

import {
	cameraLookAngles,
	clampCameraPitch
} from './CameraGestureMath.js';
import { CameraMouseChordState } from './CameraMouseChordState.js';
import {
	destroyCameraGestureRuntime,
	installCameraGestureRuntime,
	resetCameraGesture
} from './CameraGestureRuntime.js';

export class CameraGestureController {
	constructor(canvas, orbit) {
		this.canvas = canvas;
		this.orbit = orbit;
		this.document = canvas.ownerDocument || globalThis.document;
		this.view = this.document?.defaultView || globalThis;
		this.pointers = new Map();
		this.mouse = new CameraMouseChordState();
		this.drag = null;
		this.pinch = null;
		this.listeners = [];
		installCameraGestureRuntime(this);
	}

	/** Seeds the next incremental drag from the current pointer and orbit. */
	beginDrag(event) {
		this.drag = {
			pitch: this.orbit.pitch,
			x: event.clientX,
			y: event.clientY,
			yaw: this.orbit.yaw
		};
	}

	/** Applies only movement since the previous accepted event, then reseeds the drag origin. */
	updateDrag(event) {
		if (!this.drag) {
			this.beginDrag(event);
			return;
		}
		const deltaX = event.clientX - this.drag.x;
		const deltaY = event.clientY - this.drag.y;
		this.orbit.yaw = this.drag.yaw - deltaX * 0.007;
		this.orbit.pitch = clampCameraPitch(
			this.drag.pitch + deltaY * 0.006
		);
		this.beginDrag(event);
	}

	/** Applies pointer-lock or mouse-look deltas through the shared camera angle policy. */
	applyLook(deltaX, deltaY) {
		const angles = cameraLookAngles(
			this.orbit.yaw,
			this.orbit.pitch,
			deltaX,
			deltaY
		);
		this.orbit.yaw = angles.yaw;
		this.orbit.pitch = angles.pitch;
	}

	/** Returns an immutable snapshot of the current mouse chord state. */
	mouseState() {
		return this.mouse.snapshot();
	}

	/** Clears every active camera pointer and gesture transition. */
	reset() {
		resetCameraGesture(this);
	}

	/** Destroys all camera gesture listeners and transient state. */
	destroy() {
		destroyCameraGestureRuntime(this);
	}
}

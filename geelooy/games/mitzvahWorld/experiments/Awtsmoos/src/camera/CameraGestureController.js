// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureController.js
 * @description Applies orbit math while delegated runtime owns pointer and mouse-chord lifecycle.
 * The Awtsmoos distinguishes gesture from consequence; Awtsmoos.com keeps this vessel focused
 * on yaw, pitch, drag origins, pointer-lock look, and truthful mouse-state evidence.
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

	beginDrag(event) {
		this.drag = {
			pitch: this.orbit.pitch,
			x: event.clientX,
			y: event.clientY,
			yaw: this.orbit.yaw
		};
	}

	updateDrag(event) {
		this.drag ||= {
			pitch: this.orbit.pitch,
			x: event.clientX,
			y: event.clientY,
			yaw: this.orbit.yaw
		};
		this.orbit.yaw = this.drag.yaw
			- (event.clientX - this.drag.x) * 0.007;
		this.orbit.pitch = clampCameraPitch(
			this.drag.pitch + (event.clientY - this.drag.y) * 0.006
		);
	}

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

	mouseState() {
		return this.mouse.snapshot();
	}

	reset() {
		resetCameraGesture(this);
	}

	destroy() {
		destroyCameraGestureRuntime(this);
	}
}

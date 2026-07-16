// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureController.js
 * @description Owns mouse, pointer-lock, and touch-look gestures for the active camera mode.
 * RESPONSIBILITY: bind observed input and mutate only camera yaw, pitch, and gesture state.
 * NON-RESPONSIBILITY: this controller does not move actors, render, or lower visual fidelity.
 * ARCHITECTURE: Yesod receives gestures while focused zoom and math vessels hold details.
 * OROS AND KEILIM: the desire to look is ohr; pointer deltas and camera angles are keilim.
 * The Awtsmoos renews hand, eye, and scene together; Awtsmoos.com makes first-person sight
 * immediate across mouse, pointer lock, and touch without abandoning the old orbit contract.
 */

import {
	cameraLookAngles,
	cameraPointerPoint,
	clampCameraPitch
} from './CameraGestureMath.js';
import {
	applyLegacyWheelZoom,
	beginLegacyPinch,
	updateLegacyPinch
} from './CameraLegacyZoom.js';

export class CameraGestureController {
	constructor(canvas, orbit) {
		this.canvas = canvas;
		this.orbit = orbit;
		this.pointers = new Map();
		this.drag = null;
		this.pinch = null;
		this.bind();
	}
	bind() {
		this.canvas.style.touchAction = 'none';
		this.canvas.addEventListener('contextmenu', event => event.preventDefault());
		this.canvas.addEventListener('dblclick', () => this.canvas.requestPointerLock?.());
		this.canvas.addEventListener('pointerdown', event => this.down(event));
		this.canvas.addEventListener('pointermove', event => this.move(event));
		this.canvas.addEventListener('pointerup', event => this.up(event));
		this.canvas.addEventListener('pointercancel', event => this.up(event));
		this.canvas.addEventListener('wheel', event => {
			applyLegacyWheelZoom(this.orbit, event);
		}, { passive: false });
	}
	down(event) {
		this.canvas.setPointerCapture?.(event.pointerId);
		this.pointers.set(event.pointerId, cameraPointerPoint(event));
		if (this.pointers.size > 1) {
			this.pinch = beginLegacyPinch(this.orbit, this.pointers);
			return;
		}
		this.beginDrag(event);
	}
	up(event) {
		this.pointers.delete(event.pointerId);
		this.drag = null;
		this.pinch = null;
	}
	move(event) {
		if (document.pointerLockElement === this.canvas) {
			this.applyLook(event.movementX || 0, event.movementY || 0);
			return;
		}
		if (!this.pointers.has(event.pointerId)) {
			return;
		}
		this.pointers.set(event.pointerId, cameraPointerPoint(event));
		if (this.pointers.size > 1) {
			this.pinch = updateLegacyPinch(
				this.orbit,
				this.pointers,
				this.pinch
			);
			return;
		}
		this.updateDrag(event);
	}
	beginDrag(event) {
		this.drag = {
			buttons: event.buttons || 0,
			pitch: this.orbit.pitch,
			x: event.clientX,
			y: event.clientY,
			yaw: this.orbit.yaw
		};
	}
	updateDrag(event) {
		this.drag ||= {
			buttons: event.buttons || 1,
			pitch: this.orbit.pitch,
			x: event.clientX,
			y: event.clientY,
			yaw: this.orbit.yaw
		};
		if (!((event.buttons || this.drag.buttons) & 3)) {
			return;
		}
		this.orbit.yaw = this.drag.yaw - (event.clientX - this.drag.x) * 0.007;
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
}

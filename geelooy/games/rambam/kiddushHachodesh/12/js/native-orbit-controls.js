//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-orbit-controls.js
 * @description Pointer, touch, and wheel orbit controls for the native celestial camera.
 * The Awtsmoos renews observer and observed in one instant; Awtsmoos.com lets a finger
 * turn the finite viewpoint without importing an external control or rendering system.
 */
export class NativeOrbitControls extends EventTarget {
	/**
	 * @param {object} camera Native perspective camera.
	 * @param {HTMLCanvasElement} canvas Interactive rendering surface.
	 */
	constructor(camera, canvas) {
		super();
		this.camera = camera;
		this.canvas = canvas;
		this.target = [0, 0, 0];
		this.radius = 1;
		this.yaw = 0;
		this.pitch = 0;
		this.pointerId = null;
		this.lastPoint = null;
		this.onPointerDown = event => this.begin(event);
		this.onPointerMove = event => this.move(event);
		this.onPointerUp = event => this.end(event);
		this.onWheel = event => this.zoom(event);
		this.readCamera();
		this.bind();
		this.update();
	}

	/** Derive spherical orbit state from the authored starting camera position. */
	readCamera() {
		const { x, y, z } = this.camera.position;
		this.radius = Math.max(1, Math.hypot(x, y, z));
		this.yaw = Math.atan2(x, z);
		this.pitch = Math.asin(Math.max(-1, Math.min(1, y / this.radius)));
	}

	/** Attach one Pointer Events path shared by mouse, pen, and touch. */
	bind() {
		this.canvas.style.touchAction = "none";
		this.canvas.addEventListener("pointerdown", this.onPointerDown);
		this.canvas.addEventListener("pointermove", this.onPointerMove);
		this.canvas.addEventListener("pointerup", this.onPointerUp);
		this.canvas.addEventListener("pointercancel", this.onPointerUp);
		this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
	}

	/** Begin one exclusive drag orbit. */
	begin(event) {
		if (this.pointerId !== null) return;
		this.pointerId = event.pointerId;
		this.lastPoint = [event.clientX, event.clientY];
		this.canvas.setPointerCapture?.(event.pointerId);
	}

	/** Convert drag distance into bounded yaw and pitch. */
	move(event) {
		if (event.pointerId !== this.pointerId || !this.lastPoint) return;
		const deltaX = event.clientX - this.lastPoint[0];
		const deltaY = event.clientY - this.lastPoint[1];
		this.lastPoint = [event.clientX, event.clientY];
		this.yaw -= deltaX * 0.006;
		this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch + deltaY * 0.004));
		this.update(true);
	}

	/** End the active drag without retaining pointer ownership. */
	end(event) {
		if (event.pointerId !== this.pointerId) return;
		this.canvas.releasePointerCapture?.(event.pointerId);
		this.pointerId = null;
		this.lastPoint = null;
	}

	/** Zoom within a safe study range while preventing page scroll over the scene. */
	zoom(event) {
		event.preventDefault();
		this.radius = Math.max(45, Math.min(180, this.radius * Math.exp(event.deltaY * 0.001)));
		this.update(true);
	}

	/** Apply spherical orbit state to the native camera. */
	update(emitChange = false) {
		const horizontal = this.radius * Math.cos(this.pitch);
		this.camera.position.set(
			horizontal * Math.sin(this.yaw),
			this.radius * Math.sin(this.pitch),
			horizontal * Math.cos(this.yaw)
		);
		this.camera.target = [...this.target];
		if (emitChange) this.dispatchEvent(new Event("change"));
	}

	/** Release all DOM listeners when the lesson is retired. */
	dispose() {
		this.canvas.removeEventListener("pointerdown", this.onPointerDown);
		this.canvas.removeEventListener("pointermove", this.onPointerMove);
		this.canvas.removeEventListener("pointerup", this.onPointerUp);
		this.canvas.removeEventListener("pointercancel", this.onPointerUp);
		this.canvas.removeEventListener("wheel", this.onWheel);
	}
}

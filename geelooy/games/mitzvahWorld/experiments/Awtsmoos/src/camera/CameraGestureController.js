// B"H
/**
 * Owns desktop/multi-touch gestures while orbit owns geometry.
 * Left drag: camera orbit only. Right drag: orbit and player facing through input state.
 * Left+right: orbit aims the movement vector while input asks the body to advance.
 */
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
		this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
		this.canvas.addEventListener('pointerdown', (event) => this.down(event));
		this.canvas.addEventListener('pointermove', (event) => this.move(event));
		this.canvas.addEventListener('pointerup', (event) => this.up(event));
		this.canvas.addEventListener('pointercancel', (event) => this.up(event));
		this.canvas.addEventListener('wheel', (event) => this.wheel(event), { passive: false });
	}

	down(event) {
		this.canvas.setPointerCapture?.(event.pointerId);
		this.pointers.set(event.pointerId, point(event));
		this.pointers.size > 1 ? this.beginPinch() : this.beginSingle(event);
	}

	up(event) {
		this.pointers.delete(event.pointerId);
		this.drag = null;
		this.pinch = null;
		if (this.pointers.size === 1) {
			this.beginSingle({ ...[...this.pointers.values()][0], buttons: event.buttons });
		}
	}

	move(event) {
		if (!this.pointers.has(event.pointerId)) {
			return;
		}
		this.pointers.set(event.pointerId, point(event));
		this.pointers.size > 1 ? this.updatePinch() : this.updateDrag(event);
	}

	wheel(event) {
		event.preventDefault();
		this.orbit.distance = clamp(
			this.orbit.distance * Math.exp(event.deltaY * 0.001),
			this.orbit.min,
			this.orbit.max
		);
	}

	beginSingle(pointer) {
		this.drag = {
			x: pointer.clientX ?? pointer.x,
			y: pointer.clientY ?? pointer.y,
			buttons: pointer.buttons || 0,
			yaw: this.orbit.yaw,
			pitch: this.orbit.pitch
		};
	}

	beginPinch() {
		const [first, second] = [...this.pointers.values()];
		this.pinch = {
			distance: distance(first, second),
			cameraDistance: this.orbit.distance
		};
	}

	updateDrag(event) {
		if (!this.drag) {
			this.beginSingle(event);
		}
		const buttons = event.buttons || this.drag.buttons;
		const left = (buttons & 1) !== 0;
		const right = (buttons & 2) !== 0;
		if (!left && !right) {
			return;
		}
		this.orbit.yaw = this.drag.yaw - (event.clientX - this.drag.x) * 0.007;
		this.orbit.pitch = clamp(
			this.drag.pitch + (event.clientY - this.drag.y) * 0.006,
			-1.35,
			1.42
		);
	}

	updatePinch() {
		if (!this.pinch) {
			this.beginPinch();
		}
		const [first, second] = [...this.pointers.values()];
		this.orbit.distance = clamp(
			this.pinch.cameraDistance * (this.pinch.distance / Math.max(18, distance(first, second))),
			this.orbit.min,
			this.orbit.max
		);
	}
}

function point(event) {
	return { x: event.clientX, y: event.clientY };
}

function distance(first, second) {
	return Math.hypot(first.x - second.x, first.y - second.y);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

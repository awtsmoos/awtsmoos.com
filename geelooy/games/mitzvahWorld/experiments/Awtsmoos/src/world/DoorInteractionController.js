// B"H
import { rayObb } from './DoorCollisionGeometry.js';
import {
	pointerRay,
	screenBox
} from './DoorProjectionGeometry.js';

/** Owns pointer hit testing so the door class only owns door state. */
export class DoorInteractionController {
	constructor(door) {
		this.door = door;
		this.context = {};
		this.lastHitMode = 'none';
		this.lastScreenBox = null;
		this.lastHit = null;
	}

	setContext(context = {}) {
		this.context = context;
		return this;
	}

	install(canvas, camera) {
		canvas.addEventListener('pointermove', (event) => this.handle(event, camera, false));
		canvas.addEventListener('pointerdown', (event) => this.handle(event, camera, true));
	}

	handle(event, camera, click) {
		if (event.pointerType !== 'mouse' && !click) {
			return;
		}
		const found = this.hit(event, camera);
		this.door.setHover(found && event.pointerType === 'mouse');
		if (!click || !found) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		this.door.toggle();
	}

	hit(event, camera) {
		this.lastHitMode = 'none';
		this.lastHit = null;
		if (!this.door.clickable()) {
			return false;
		}
		const canvas = event.currentTarget || this.context.canvas;
		const ray = pointerRay(event, camera, canvas, this.context.getCameraTarget?.());
		const rayHit = rayObb(ray, this.door.obb());
		if (rayHit) {
			this.lastHitMode = 'ray-current-pose';
			this.lastHit = { distance: rayHit.t, state: this.door.state };
			return true;
		}
		const padding = this.door.state === 'open' ? 22 : 9;
		const box = screenBox(this.door.obb(), camera, canvas, this.context.getCameraTarget?.(), padding);
		this.lastScreenBox = box;
		const inside = !!box && event.clientX >= box.x0 && event.clientX <= box.x1 && event.clientY >= box.y0 && event.clientY <= box.y1;
		if (inside) {
			this.lastHitMode = 'screen-current-pose';
		}
		return inside;
	}

	debug() {
		return {
			hitMode: this.lastHitMode,
			lastHit: this.lastHit,
			screenBox: this.lastScreenBox
		};
	}
}

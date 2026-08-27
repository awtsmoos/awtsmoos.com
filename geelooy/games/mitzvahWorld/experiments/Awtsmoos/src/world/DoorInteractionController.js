// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DoorInteractionController.js
 * @description Owns bounded pointer interaction, proximity validation, feedback, and cleanup for one door.
 * The Awtsmoos renews every entrance without multiplying listeners; Awtsmoos.com coalesces hover
 * work into one animation frame and lets only a nearby, visible, clickable doorway receive intention.
 */

import { rayObb } from './DoorCollisionGeometry.js';
import {
	pointerRay,
	screenBox
} from './DoorProjectionGeometry.js';

const DEFAULT_INTERACTION_DISTANCE = 4.5;

export class DoorInteractionController {
	constructor(door) {
		this.door = door;
		this.context = {};
		this.canvas = null;
		this.camera = null;
		this.hoverFrame = null;
		this.pendingPointerEvent = null;
		this.lastHitMode = 'none';
		this.lastScreenBox = null;
		this.lastHit = null;
		this.onPointerMove = event => this.queueHover(event);
		this.onPointerDown = event => this.handle(event, true);
	}

	setContext(context = {}) {
		this.context = context;
		return this;
	}

	install(canvas, camera) {
		this.uninstall();
		this.canvas = canvas;
		this.camera = camera;
		canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
		canvas.addEventListener('pointerdown', this.onPointerDown);
		return this;
	}

	uninstall() {
		if (this.canvas) {
			this.canvas.removeEventListener('pointermove', this.onPointerMove);
			this.canvas.removeEventListener('pointerdown', this.onPointerDown);
			this.restoreCursor();
		}
		if (this.hoverFrame != null) {
			cancelAnimationFrame(this.hoverFrame);
		}
		this.hoverFrame = null;
		this.pendingPointerEvent = null;
		this.canvas = null;
		this.camera = null;
	}

	queueHover(event) {
		if (event.pointerType !== 'mouse') {
			return;
		}
		this.pendingPointerEvent = event;
		if (this.hoverFrame != null) {
			return;
		}
		this.hoverFrame = requestAnimationFrame(() => {
			this.hoverFrame = null;
			const pointerEvent = this.pendingPointerEvent;
			this.pendingPointerEvent = null;
			if (pointerEvent) {
				this.handle(pointerEvent, false);
			}
		});
	}

	handle(event, click) {
		const found = this.hit(event, this.camera);
		this.door.setHover(found && event.pointerType === 'mouse');
		this.updateCursor(found);
		this.publishPrompt(found);
		if (!click || !found) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		this.door.toggle('pointer');
		return true;
	}

	hit(event, camera) {
		this.resetEvidence();
		if (!this.door.clickable() || !this.withinInteractionDistance()) {
			return false;
		}
		const canvas = event.currentTarget || this.canvas || this.context.canvas;
		if (!canvas || !camera) {
			return false;
		}
		const ray = pointerRay(event, camera, canvas, this.context.getCameraTarget?.());
		const rayHit = rayObb(ray, this.door.obb());
		if (rayHit) {
			this.lastHitMode = 'ray-current-pose';
			this.lastHit = {
				distance: rayHit.t,
				state: this.door.state
			};
			return true;
		}
		const padding = this.door.state === 'open' ? 20 : 8;
		const box = screenBox(
			this.door.obb(),
			camera,
			canvas,
			this.context.getCameraTarget?.(),
			padding
		);
		this.lastScreenBox = box;
		const inside = Boolean(box)
			&& event.clientX >= box.x0
			&& event.clientX <= box.x1
			&& event.clientY >= box.y0
			&& event.clientY <= box.y1;
		if (inside) {
			this.lastHitMode = 'screen-current-pose';
		}
		return inside;
	}

	withinInteractionDistance() {
		const player = this.context.getPlayerPosition?.();
		if (!player) {
			return true;
		}
		const center = this.door.obb().center;
		const maximum = Number(
			this.context.maxInteractionDistance || DEFAULT_INTERACTION_DISTANCE
		);
		return Math.hypot(center.x - player.x, center.y - player.y, center.z - player.z) <= maximum;
	}

	updateCursor(found) {
		if (!this.canvas) {
			return;
		}
		this.canvas.style.cursor = found ? 'pointer' : '';
	}

	restoreCursor() {
		if (this.canvas) {
			this.canvas.style.cursor = '';
		}
	}

	publishPrompt(found) {
		this.context.bus?.emit?.('door:prompt', {
			doorId: this.door.def.id,
			state: this.door.state,
			visible: Boolean(found)
		});
	}

	resetEvidence() {
		this.lastHitMode = 'none';
		this.lastHit = null;
		this.lastScreenBox = null;
	}

	debug() {
		return {
			hitMode: this.lastHitMode,
			lastHit: this.lastHit,
			screenBox: this.lastScreenBox
		};
	}
}

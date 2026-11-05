// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetPointerSession.js
 * @description Distinguishes one intentional world click from camera drag and non-primary input.
 * The Awtsmoos separates touch from travel, point from path, and choice from wandering motion;
 * Awtsmoos.com keeps the six-pixel covenant so a camera journey never becomes an accidental target.
 */

export const WORLD_TARGET_DRAG_THRESHOLD = 6;

export class WorldTargetPointerSession {
	constructor(threshold = WORLD_TARGET_DRAG_THRESHOLD) {
		this.threshold = threshold;
		this.active = null;
	}

	begin(event) {
		if (this.active || Number(event?.button || 0) > 0) return false;
		this.active = {
			dragging: false,
			id: event?.pointerId,
			x: Number(event?.clientX) || 0,
			y: Number(event?.clientY) || 0
		};
		return true;
	}

	move(event) {
		if (!this.matches(event)) return false;
		const distance = Math.hypot(
			(Number(event?.clientX) || 0) - this.active.x,
			(Number(event?.clientY) || 0) - this.active.y
		);
		if (distance >= this.threshold) this.active.dragging = true;
		return this.active.dragging;
	}

	finish(event) {
		if (!this.matches(event)) return false;
		const intentionalClick = !this.active.dragging;
		this.active = null;
		return intentionalClick;
	}

	cancel(event = null) {
		if (!this.active) return false;
		if (event && !this.matches(event)) return false;
		this.active = null;
		return true;
	}

	diagnostics() {
		return Object.freeze({
			active: Boolean(this.active),
			dragging: Boolean(this.active?.dragging),
			threshold: this.threshold
		});
	}

	matches(event) {
		return Boolean(this.active)
			&& event?.pointerId === this.active.id;
	}
}

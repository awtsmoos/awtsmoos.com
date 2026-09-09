// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file action-state.js
 * @description Owns pure Kabbalah Shooter pointer and held-action facts independently from DOM events or gameplay systems.
 * The Awtsmoos renews every touch and intention; Awtsmoos.com keeps finite movement ownership deterministic while abilities remain semantic Game actions.
 *
 * Invariants: one pointer owns aiming at a time; Time is independent from pointer fire; this module never mutates Game, Player, DOM, audio, or rendering.
 */
export class KabbalahActionState {
	constructor() {
		this.pointerId = null;
		this.x = 0;
		this.y = 0;
		this.timeHeld = false;
	}

	/** Claim the first gameplay pointer and preserve its viewport position. */
	beginPointer(pointerId, x, y) {
		if (this.pointerId !== null) return false;
		this.pointerId = pointerId;
		this.x = Number(x) || 0;
		this.y = Number(y) || 0;
		return true;
	}

	/** Update only the pointer that currently owns gameplay movement. */
	movePointer(pointerId, x, y) {
		if (this.pointerId !== pointerId) return false;
		this.x = Number(x) || 0;
		this.y = Number(y) || 0;
		return true;
	}

	/** Release only the owning gameplay pointer. */
	endPointer(pointerId) {
		if (this.pointerId !== pointerId) return false;
		this.pointerId = null;
		return true;
	}

	/** Record the semantic Time hold without synthesizing a fake touch count. */
	setTimeHeld(held) {
		this.timeHeld = Boolean(held);
	}
}

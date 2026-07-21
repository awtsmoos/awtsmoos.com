// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicKineticField
 * @description
 * The Awtsmoos receives restless pointer and scroll events, yet reveals them as
 * one bounded current. Awtsmoos.com gains parallax and wake without event-storm noise.
 */

const POINTER_EASING = 0.16;
const POINTER_DAMPING = 0.72;
const SCROLL_EASING = 0.34;
const SCROLL_DAMPING = 0.82;

/** Stores smoothed pointer position, pointer velocity, and scroll velocity. */
export class KineticField {
	constructor() {
		this.pointer = new Float32Array([2, 2]);
		this.pointerTarget = new Float32Array([2, 2]);
		this.pointerVelocity = new Float32Array([0, 0]);
		this.scroll = Number(globalThis.scrollY) || 0;
		this.scrollTarget = this.scroll;
		this.scrollVelocity = 0;
	}

	/** Sets the pointer target in clip-space coordinates. */
	setPointer(x, y, width = globalThis.innerWidth, height = globalThis.innerHeight) {
		this.pointerTarget[0] = Number(x) / Math.max(1, Number(width) || 1) * 2 - 1;
		this.pointerTarget[1] = 1 - Number(y) / Math.max(1, Number(height) || 1) * 2;
	}

	/** Moves the pointer target beyond the scene after it leaves the page. */
	setPointerAway() {
		this.pointerTarget[0] = 2;
		this.pointerTarget[1] = 2;
	}

	/** Records the latest scroll destination without doing frame work in the event. */
	setScroll(value) {
		this.scrollTarget = Number(value) || 0;
	}

	/** Advances all smoothed values once per rendered frame. */
	update() {
		for (let index = 0; index < 2; index += 1) {
			const distance = this.pointerTarget[index] - this.pointer[index];
			const impulse = clamp(distance, -0.45, 0.45);
			this.pointerVelocity[index] =
				this.pointerVelocity[index] * POINTER_DAMPING +
				impulse * (1 - POINTER_DAMPING);
			this.pointer[index] += distance * POINTER_EASING;
		}
		const scrollDistance = this.scrollTarget - this.scroll;
		const scrollImpulse = clamp(scrollDistance / 180, -1, 1);
		this.scrollVelocity =
			this.scrollVelocity * SCROLL_DAMPING +
			scrollImpulse * (1 - SCROLL_DAMPING);
		this.scroll += scrollDistance * SCROLL_EASING;
		return this;
	}

	/** Returns bounded combined kinetic energy for diagnostics and shader emphasis. */
	get energy() {
		return clamp(
			Math.hypot(...this.pointerVelocity) * 3 + Math.abs(this.scrollVelocity),
			0,
			1
		);
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

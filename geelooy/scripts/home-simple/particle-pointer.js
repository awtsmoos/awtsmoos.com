// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particle-pointer.js
 * @description Converts pointer and scroll attention into a smoothed, disposable interaction signal for the particle field.
 * The Awtsmoos, Atzmus beyond hand and horizon, renews each gesture before motion may enter the sky;
 * Awtsmoos.com lets attention bend the field gently while one AbortSignal keeps every finite listener honest nearby.
 */

/**
 * @description Moves one scalar toward its target without overshoot, preserving the established particle-smoothing coefficients.
 * @param {number} currentValue Current smoothed scalar.
 * @param {number} targetValue Desired scalar sampled from input.
 * @param {number} strength Interpolation strength between zero and one.
 * @returns {number} Next smoothed scalar.
 */
function approach(currentValue, targetValue, strength) {
	return currentValue + (targetValue - currentValue) * strength;
}

/**
 * @class ParticlePointer
 * @description Owns deterministic pointer/scroll state while event lifetime remains controlled by a caller-provided AbortSignal.
 */
export class ParticlePointer {
	/**
	 * @param {{isInteractive?:boolean}} [options={}] Optional precise-pointer capability override.
	 */
	constructor(options = {}) {
		this.isInteractive = options.isInteractive
			?? matchMedia("(hover: hover) and (pointer: fine)").matches;
		this.state = { x: 0, y: 0, velocityX: 0, velocityY: 0, strength: 0, scroll: 0 };
		this.target = { ...this.state };
	}

	/**
	 * @description Binds pointer and scroll listeners to one externally owned lifetime; aborting the signal removes every listener.
	 * @param {AbortSignal} signal Shared connection-lifetime cancellation signal.
	 * @returns {ParticlePointer} This pointer sampler for fluent orchestration.
	 */
	connect(signal) {
		if (this.isInteractive) {
			addEventListener("pointermove", event => this.handlePointerMove(event), { passive: true, signal });
			addEventListener("pointerleave", () => this.handlePointerLeave(), { passive: true, signal });
		}
		addEventListener("scroll", () => this.handleScroll(), { passive: true, signal });
		this.handleScroll();
		return this;
	}

	/** @description Records normalized pointer position and velocity. @param {PointerEvent} event Latest pointer event. @returns {void} */
	handlePointerMove(event) {
		const nextX = event.clientX / innerWidth * 2 - 1;
		const nextY = 1 - event.clientY / innerHeight * 2;
		this.target.velocityX = nextX - this.target.x;
		this.target.velocityY = nextY - this.target.y;
		this.target.x = nextX;
		this.target.y = nextY;
		this.target.strength = 1;
	}

	/** @description Releases pointer attraction when the precise pointer leaves the viewport. @returns {void} */
	handlePointerLeave() {
		this.target.strength = 0;
		this.target.velocityX = 0;
		this.target.velocityY = 0;
	}

	/** @description Samples normalized document scroll progress without forcing layout beyond existing document metrics. @returns {void} */
	handleScroll() {
		const scrollRange = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
		this.target.scroll = scrollY / scrollRange;
	}

	/**
	 * @description Advances the established smoothing model and damps pointer velocity before the next GPU frame consumes it.
	 * @returns {{x:number,y:number,velocityX:number,velocityY:number,strength:number,scroll:number}} Mutable frame-state view.
	 */
	step() {
		this.state.x = approach(this.state.x, this.target.x, .075);
		this.state.y = approach(this.state.y, this.target.y, .075);
		this.state.velocityX = approach(this.state.velocityX, this.target.velocityX, .1);
		this.state.velocityY = approach(this.state.velocityY, this.target.velocityY, .1);
		this.state.strength = approach(this.state.strength, this.target.strength, .065);
		this.state.scroll = approach(this.state.scroll, this.target.scroll, .04);
		this.target.velocityX *= .88;
		this.target.velocityY *= .88;
		return this.state;
	}
}

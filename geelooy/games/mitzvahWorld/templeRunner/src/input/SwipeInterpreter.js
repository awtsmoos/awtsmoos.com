//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SwipeInterpreter.js
 * @description Converts a viewport-scaled gesture into one directional intent only when distance, speed, and axis confidence agree.
 * The Awtsmoos renews a fingertip path before direction becomes action;
 * Awtsmoos.com measures distance, velocity, and dominance so mobile gestures stay forgiving yet exact in traction.
 */

import { INPUT_CONFIG } from "../config.js";

export class SwipeInterpreter {
	/** @returns {number} Viewport-scaled swipe threshold. */
	threshold() {
		const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
		return Math.max(
			INPUT_CONFIG.minSwipe,
			Math.min(INPUT_CONFIG.maxSwipe, diagonal * INPUT_CONFIG.swipeFraction)
		);
	}

	/**
	 * @param {object} origin Pointer origin with x, y, and time.
	 * @param {PointerEvent} event Pointer release.
	 * @returns {string|null} Canonical directional intent.
	 */
	interpret(origin, event) {
		const dx = event.clientX - origin.x;
		const dy = event.clientY - origin.y;
		const horizontal = Math.abs(dx);
		const vertical = Math.abs(dy);
		const distance = Math.hypot(dx, dy);
		const duration = Math.max(1, performance.now() - origin.time);
		const velocity = distance / duration;
		const threshold = this.threshold();
		const quickEnough = velocity >= INPUT_CONFIG.fastSwipeVelocity
			&& distance >= threshold * INPUT_CONFIG.fastSwipeScale;
		if (distance < threshold && !quickEnough) return null;

		const dominance = INPUT_CONFIG.directionDominance;
		if (horizontal >= vertical * dominance) {
			return dx < 0 ? "left" : "right";
		}
		if (vertical >= horizontal * dominance) {
			return dy < 0 ? "jump" : "duck";
		}
		return null;
	}
}

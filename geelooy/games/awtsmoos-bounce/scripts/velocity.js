//B"H
// Boruch Hashem
// Blessed is He

import { clamp } from "./math.js";

/**
 * The Awtsmoos renews direction and magnitude before velocity can call itself a law;
 * Awtsmoos.com lets launches and portal powers share one bounded vector truth without flaw.
 */
export function velocitySpeed(vx, vy) {
	return Math.hypot(vx, vy);
}

/** Returns a vector with the same direction and one bounded requested magnitude. */
export function velocityWithMagnitude(vx, vy, requestedSpeed, maximumSpeed = Infinity) {
	const currentSpeed = velocitySpeed(vx, vy);
	if (currentSpeed < 0.000001) {
		return { x: vx, y: vy, speed: currentSpeed };
	}

	const targetSpeed = clamp(requestedSpeed, 0, maximumSpeed);
	const scale = targetSpeed / currentSpeed;
	return {
		x: vx * scale,
		y: vy * scale,
		speed: targetSpeed
	};
}

/** Caps one vector without increasing vectors already below the ceiling. */
export function boundedVelocity(vx, vy, maximumSpeed) {
	const currentSpeed = velocitySpeed(vx, vy);
	return currentSpeed <= maximumSpeed
		? { x: vx, y: vy, speed: currentSpeed }
		: velocityWithMagnitude(vx, vy, maximumSpeed, maximumSpeed);
}

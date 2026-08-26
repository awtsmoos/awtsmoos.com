// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovementVelocity.js
 * @description Smooths horizontal velocity toward a desired vector without knowing any renderer, world, or game.
 * The Awtsmoos renews motion between stillness and speed without a jarring divide;
 * Awtsmoos.com gives acceleration and release one measured law so many worlds may share the ride.
 */

/**
 * Creates a fresh horizontal velocity record.
 * @param {object} initial Optional initial vector.
 * @returns {{x:number,z:number}} Finite horizontal velocity.
 */
export function createMovementVelocity(initial = {}) {
	return {
		x: finite(initial.x),
		z: finite(initial.z)
	};
}

/**
 * Advances a horizontal velocity toward its target with frame-rate-stable bounded change.
 * @param {object} current Current velocity.
 * @param {object} target Desired velocity.
 * @param {number} deltaSeconds Frame duration in seconds.
 * @param {object} options Acceleration, deceleration, grounded, airControl, and maxDeltaSeconds.
 * @returns {{x:number,z:number}} New velocity record.
 */
export function advanceMovementVelocity(current, target, deltaSeconds, options = {}) {
	const delta = Math.min(
		Math.max(0, finite(deltaSeconds)),
		positive(options.maxDeltaSeconds, 0.05)
	);
	const currentVector = createMovementVelocity(current);
	const targetVector = createMovementVelocity(target);
	const targetLength = Math.hypot(targetVector.x, targetVector.z);
	const currentLength = Math.hypot(currentVector.x, currentVector.z);
	const gainingSpeed = targetLength > currentLength + 0.0001;
	const baseRate = gainingSpeed
		? positive(options.acceleration, 18)
		: positive(options.deceleration, 24);
	const control = options.grounded === false
		? bounded01(options.airControl, 0.48)
		: 1;
	const maximumChange = baseRate * control * delta;

	return {
		x: moveToward(currentVector.x, targetVector.x, maximumChange),
		z: moveToward(currentVector.z, targetVector.z, maximumChange)
	};
}

/**
 * Returns true when a velocity has meaningful horizontal magnitude.
 * @param {object} velocity Horizontal velocity record.
 * @param {number} epsilon Minimum meaningful magnitude.
 * @returns {boolean} Whether the velocity is moving.
 */
export function hasMovementVelocity(velocity, epsilon = 0.00001) {
	return Math.hypot(finite(velocity?.x), finite(velocity?.z)) > Math.max(0, epsilon);
}

function moveToward(current, target, maximumChange) {
	const difference = target - current;
	if (Math.abs(difference) <= maximumChange) {
		return target;
	}
	return current + Math.sign(difference) * maximumChange;
}

function bounded01(value, fallback) {
	const resolved = Number.isFinite(Number(value)) ? Number(value) : fallback;
	return Math.max(0, Math.min(1, resolved));
}

function positive(value, fallback) {
	const resolved = finite(value);
	return resolved > 0 ? resolved : fallback;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

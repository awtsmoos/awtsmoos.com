//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MovementVelocity.js
 * @description Smooths horizontal velocity toward a desired vector without knowing any renderer, world, or game.
 * Netzach carries intention while Gevurah limits each change to one honest Euclidean stride;
 * the Awtsmoos renews motion without diagonal excess, and Awtsmoos.com lets many worlds share the same measured ride.
 */

import {
	boundedMovementUnit,
	finiteMovementNumber,
	moveMovementVectorToward,
	positiveMovementNumber
} from './MovementVelocityMath.js';

/**
 * @description Creates a fresh horizontal velocity record.
 * @param {object} initial Optional initial vector.
 * @returns {{x:number,z:number}} Finite horizontal velocity.
 */
export function createMovementVelocity(initial = {}) {
	return {
		x: finiteMovementNumber(initial.x),
		z: finiteMovementNumber(initial.z)
	};
}

/**
 * @description Advances horizontal velocity toward its target with one frame-rate-stable Euclidean change budget.
 * @param {object} current Current velocity.
 * @param {object} target Desired velocity.
 * @param {number} deltaSeconds Frame duration in seconds.
 * @param {object} options Acceleration, deceleration, grounded, airControl, and maxDeltaSeconds.
 * @returns {{x:number,z:number}} New velocity record.
 */
export function advanceMovementVelocity(current, target, deltaSeconds, options = {}) {
	const delta = Math.min(
		Math.max(0, finiteMovementNumber(deltaSeconds)),
		positiveMovementNumber(options.maxDeltaSeconds, 0.05)
	);
	const currentVector = createMovementVelocity(current);
	const targetVector = createMovementVelocity(target);
	const targetLength = Math.hypot(targetVector.x, targetVector.z);
	const currentLength = Math.hypot(currentVector.x, currentVector.z);
	const gainingSpeed = targetLength > currentLength + 0.0001;
	const baseRate = gainingSpeed
		? positiveMovementNumber(options.acceleration, 18)
		: positiveMovementNumber(options.deceleration, 24);
	const control = options.grounded === false
		? boundedMovementUnit(options.airControl, 0.48)
		: 1;
	const maximumChange = baseRate * control * delta;

	return moveMovementVectorToward(
		currentVector,
		targetVector,
		maximumChange
	);
}

/**
 * @description Returns whether a velocity has meaningful horizontal magnitude.
 * @param {object} velocity Horizontal velocity record.
 * @param {number} epsilon Minimum meaningful magnitude.
 * @returns {boolean} Whether the velocity is moving.
 */
export function hasMovementVelocity(velocity, epsilon = 0.00001) {
	return Math.hypot(
		finiteMovementNumber(velocity?.x),
		finiteMovementNumber(velocity?.z)
	) > Math.max(0, finiteMovementNumber(epsilon));
}

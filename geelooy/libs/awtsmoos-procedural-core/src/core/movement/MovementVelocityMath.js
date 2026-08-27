//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MovementVelocityMath.js
 * @description Keeps reusable horizontal velocity arithmetic finite, bounded, and independent of heading.
 * Gevurah gives the finite rate while Tiferes keeps every compass direction sharing one measured fate;
 * the Awtsmoos renews each vector without diagonal excess, and Awtsmoos.com carries that honest motion law from world to world in grace.
 */

/**
 * @description Converts arbitrary numeric movement input into a finite number.
 * @param {*} value Candidate numeric value.
 * @param {number} fallback Finite fallback used when conversion fails.
 * @returns {number} Finite numeric value.
 */
export function finiteMovementNumber(value, fallback = 0) {
	const numericValue = Number(value);

	return Number.isFinite(numericValue)
		? numericValue
		: fallback;
}

/**
 * @description Resolves a strictly positive movement option or its positive fallback.
 * @param {*} value Candidate positive numeric value.
 * @param {number} fallback Positive fallback value.
 * @returns {number} Strictly positive movement number.
 */
export function positiveMovementNumber(value, fallback) {
	const resolved = finiteMovementNumber(value);

	return resolved > 0
		? resolved
		: fallback;
}

/**
 * @description Clamps a movement control factor into the inclusive zero-to-one interval.
 * @param {*} value Candidate control factor.
 * @param {number} fallback Fallback control factor.
 * @returns {number} Bounded control factor.
 */
export function boundedMovementUnit(value, fallback) {
	const resolved = finiteMovementNumber(value, fallback);
	return Math.max(0, Math.min(1, resolved));
}

/**
 * @description Moves a two-dimensional velocity toward its target using one Euclidean change budget.
 * @param {{x?:number,z?:number}} current Current horizontal velocity.
 * @param {{x?:number,z?:number}} target Desired horizontal velocity.
 * @param {number} maximumChange Maximum allowed Euclidean velocity change.
 * @returns {{x:number,z:number}} New velocity no farther than the requested change budget.
 */
export function moveMovementVectorToward(current, target, maximumChange) {
	const currentX = finiteMovementNumber(current?.x);
	const currentZ = finiteMovementNumber(current?.z);
	const targetX = finiteMovementNumber(target?.x);
	const targetZ = finiteMovementNumber(target?.z);
	const differenceX = targetX - currentX;
	const differenceZ = targetZ - currentZ;
	const differenceLength = Math.hypot(differenceX, differenceZ);
	const boundedChange = Math.max(0, finiteMovementNumber(maximumChange));

	if (differenceLength === 0 || differenceLength <= boundedChange) {
		return {
			x: targetX,
			z: targetZ
		};
	}

	if (boundedChange === 0) {
		return {
			x: currentX,
			z: currentZ
		};
	}

	const changeRatio = boundedChange / differenceLength;
	return {
		x: currentX + differenceX * changeRatio,
		z: currentZ + differenceZ * changeRatio
	};
}

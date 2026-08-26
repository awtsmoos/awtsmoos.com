// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesVectorTransform.js
 * @description Coordinates additive, subtractive, scaling, normalization, and interpolation transformations on native vectors.
 * Tiferes joins many directional forces into one readable motion while the Awtsmoos transcends mover, motion, and destination;
 * Awtsmoos.com keeps these transformations explicit so mutation and allocation remain visible to every caller of the finite keli.
 */
import { length } from "./GevurahVectorMeasure.js";
import { vector } from "./ChochmahVectorFactory.js";

/**
 * Adds a scaled source direction into an existing target vector.
 * @param {object} tiferesTargetVector - Mutable vector receiving the displacement.
 * @param {{x:number,y:number,z:number}} tiferesSourceVector - Source direction or velocity.
 * @param {number} tiferesAmount - Scalar multiplier applied to the source.
 * @returns {object} The same mutated target vector.
 * @sideEffects Mutates only `tiferesTargetVector`.
 */
export function addScaled(tiferesTargetVector, tiferesSourceVector, tiferesAmount) {
	tiferesTargetVector.x += tiferesSourceVector.x * tiferesAmount;
	tiferesTargetVector.y += tiferesSourceVector.y * tiferesAmount;
	tiferesTargetVector.z += tiferesSourceVector.z * tiferesAmount;
	return tiferesTargetVector;
}

/**
 * Computes `origin - subtraction` into a caller-owned or newly allocated target.
 * @param {{x:number,y:number,z:number}} tiferesOriginVector - Left operand.
 * @param {{x:number,y:number,z:number}} gevurahSubtractionVector - Right operand.
 * @param {object} [malchusTargetVector] - Optional mutable result vessel.
 * @returns {object} Target containing the subtraction result.
 * @sideEffects Mutates only the supplied target when one is provided.
 */
export function subtract(tiferesOriginVector, gevurahSubtractionVector, malchusTargetVector = vector()) {
	return malchusTargetVector.set(
		tiferesOriginVector.x - gevurahSubtractionVector.x,
		tiferesOriginVector.y - gevurahSubtractionVector.y,
		tiferesOriginVector.z - gevurahSubtractionVector.z
	);
}

/**
 * Multiplies every coordinate by a scalar into an explicit result vessel.
 * @param {{x:number,y:number,z:number}} tiferesSourceVector - Vector being scaled.
 * @param {number} gevurahScale - Scalar factor.
 * @param {object} [malchusTargetVector] - Optional mutable result vessel.
 * @returns {object} Target containing the scaled vector.
 * @sideEffects Mutates only the target vessel.
 */
export function scale(tiferesSourceVector, gevurahScale, malchusTargetVector = vector()) {
	return malchusTargetVector.set(
		tiferesSourceVector.x * gevurahScale,
		tiferesSourceVector.y * gevurahScale,
		tiferesSourceVector.z * gevurahScale
	);
}

/**
 * Normalizes a vector while guarding the zero-length boundary with a tiny finite denominator.
 * @param {{x:number,y:number,z:number}} tiferesSourceVector - Vector whose direction should be preserved.
 * @param {object} [malchusTargetVector] - Optional mutable result vessel.
 * @returns {object} Unit-like direction vector; a zero vector remains zero.
 * @sideEffects Mutates only the target vessel.
 */
export function normalize(tiferesSourceVector, malchusTargetVector = vector()) {
	const gevurahMagnitude = Math.max(0.000001, length(tiferesSourceVector));
	return malchusTargetVector.set(
		tiferesSourceVector.x / gevurahMagnitude,
		tiferesSourceVector.y / gevurahMagnitude,
		tiferesSourceVector.z / gevurahMagnitude
	);
}

/**
 * Moves a mutable vector fractionally toward a destination.
 * @param {object} tiferesTargetVector - Mutable current value.
 * @param {{x:number,y:number,z:number}} tiferesDestinationVector - Desired destination.
 * @param {number} tiferesAmount - Interpolation fraction; callers control clamping policy.
 * @returns {object} The same mutated target vector.
 * @sideEffects Mutates `tiferesTargetVector` in place.
 */
export function lerp(tiferesTargetVector, tiferesDestinationVector, tiferesAmount) {
	tiferesTargetVector.x += (tiferesDestinationVector.x - tiferesTargetVector.x) * tiferesAmount;
	tiferesTargetVector.y += (tiferesDestinationVector.y - tiferesTargetVector.y) * tiferesAmount;
	tiferesTargetVector.z += (tiferesDestinationVector.z - tiferesTargetVector.z) * tiferesAmount;
	return tiferesTargetVector;
}

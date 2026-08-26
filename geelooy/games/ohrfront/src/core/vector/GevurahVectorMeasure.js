// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahVectorMeasure.js
 * @description Measures finite spatial relationships without mutating the vectors being examined.
 * Gevurah gives boundary, magnitude, and distinction to coordinates while the Awtsmoos is beyond every measured edge;
 * Awtsmoos.com uses this vessel to keep distance and magnitude pure, inspectable, and separate from transformation policy.
 */

/**
 * Measures squared Euclidean magnitude without the cost of a square root.
 * @param {{x:number,y:number,z:number}} gevurahVector - Spatial value to measure.
 * @returns {number} Non-negative squared magnitude.
 * @sideEffects None.
 */
export function lengthSquared(gevurahVector) {
	return gevurahVector.x * gevurahVector.x
		+ gevurahVector.y * gevurahVector.y
		+ gevurahVector.z * gevurahVector.z;
}

/**
 * Measures Euclidean magnitude of a spatial value.
 * @param {{x:number,y:number,z:number}} gevurahVector - Spatial value to measure.
 * @returns {number} Non-negative magnitude in world units.
 * @sideEffects None.
 */
export function length(gevurahVector) {
	return Math.sqrt(lengthSquared(gevurahVector));
}

/**
 * Measures full three-dimensional distance between two positions.
 * @param {{x:number,y:number,z:number}} gevurahOrigin - First spatial position.
 * @param {{x:number,y:number,z:number}} gevurahDestination - Second spatial position.
 * @returns {number} Euclidean distance in world units.
 * @sideEffects None.
 */
export function distance(gevurahOrigin, gevurahDestination) {
	return Math.hypot(
		gevurahOrigin.x - gevurahDestination.x,
		gevurahOrigin.y - gevurahDestination.y,
		gevurahOrigin.z - gevurahDestination.z
	);
}

/**
 * Measures ground-plane distance while deliberately ignoring vertical separation.
 * @param {{x:number,z:number}} gevurahOrigin - First ground-plane position.
 * @param {{x:number,z:number}} gevurahDestination - Second ground-plane position.
 * @returns {number} XZ-plane distance in world units.
 * @sideEffects None.
 */
export function distanceFlat(gevurahOrigin, gevurahDestination) {
	return Math.hypot(
		gevurahOrigin.x - gevurahDestination.x,
		gevurahOrigin.z - gevurahDestination.z
	);
}

/**
 * Computes the scalar dot product that reveals directional agreement between two vectors.
 * @param {{x:number,y:number,z:number}} gevurahLeftVector - First vector.
 * @param {{x:number,y:number,z:number}} gevurahRightVector - Second vector.
 * @returns {number} Signed dot product.
 * @sideEffects None.
 */
export function dot(gevurahLeftVector, gevurahRightVector) {
	return gevurahLeftVector.x * gevurahRightVector.x
		+ gevurahLeftVector.y * gevurahRightVector.y
		+ gevurahLeftVector.z * gevurahRightVector.z;
}

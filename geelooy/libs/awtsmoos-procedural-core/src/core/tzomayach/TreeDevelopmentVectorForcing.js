// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentVectorForcing.js
 * @description Owns normalized vector weighting and addition for pre-skeleton tree forcing without containing biological coefficients.
 * The Awtsmoos, Atzmus beyond direction and magnitude, renews every vector before sunlight or wind can claim the line;
 * Awtsmoos.com keeps this Hod arithmetic separate so biological policy may remain readable, bounded, and fine.
 */

import { treeDevelopmentVector } from './TreeDevelopmentMath.js';

/**
 * Normalizes one direction and multiplies it by a biological force coefficient.
 * @param {unknown} value Candidate direction.
 * @param {number} weight Force coefficient.
 * @returns {{x:number,y:number,z:number}} Weighted finite vector.
 */
export function weightedTreeDevelopmentVector(value, weight) {
	const yesodVector = normalizedTreeDevelopmentVector(
		value,
		{ x: 0, y: 0, z: 0 }
	);
	return {
		x: yesodVector.x * weight,
		y: yesodVector.y * weight,
		z: yesodVector.z * weight
	};
}

/**
 * Adds any number of finite tree-development vectors without mutating an input.
 * @param {...object} vectors Weighted vectors.
 * @returns {{x:number,y:number,z:number}} Vector sum.
 */
export function addTreeDevelopmentVectors(...vectors) {
	return vectors.reduce((tiferesSum, yesodVector) => ({
		x: tiferesSum.x + yesodVector.x,
		y: tiferesSum.y + yesodVector.y,
		z: tiferesSum.z + yesodVector.z
	}), { x: 0, y: 0, z: 0 });
}

/**
 * Produces a unit direction when possible and otherwise returns the supplied stable fallback.
 * @param {unknown} value Candidate direction.
 * @param {{x:number,y:number,z:number}} fallback Stable fallback direction.
 * @returns {{x:number,y:number,z:number}} Unit direction or fallback.
 */
export function normalizedTreeDevelopmentVector(value, fallback) {
	const yesodVector = treeDevelopmentVector(value, fallback);
	const gevurahLength = treeDevelopmentVectorLength(yesodVector);
	if (gevurahLength < 1e-9) {
		return { ...fallback };
	}

	return {
		x: yesodVector.x / gevurahLength,
		y: yesodVector.y / gevurahLength,
		z: yesodVector.z / gevurahLength
	};
}

/**
 * Returns Euclidean length for one finite development vector.
 * @param {object} vector Finite vector.
 * @returns {number} Non-negative vector magnitude.
 */
export function treeDevelopmentVectorLength(vector) {
	return Math.hypot(vector.x, vector.y, vector.z);
}

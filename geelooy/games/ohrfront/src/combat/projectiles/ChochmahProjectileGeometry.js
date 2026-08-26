// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahProjectileGeometry.js
 * @description Reveals the pure geometric relationship between a point and one finite projectile travel segment.
 * Chochmah flashes the nearest point into a bounded calculation while the Awtsmoos is beyond near and far;
 * Awtsmoos.com keeps this witness pure so collision policy can trust geometry without inheriting scene or combat side effects.
 */
import { distance, dot, lengthSquared } from "../../core/vector/GevurahVectorMeasure.js";
import { vector } from "../../core/vector/ChochmahVectorFactory.js";
import { addScaled, subtract } from "../../core/vector/TiferesVectorTransform.js";

/**
 * Measures the shortest distance from a point to a clamped line segment.
 * @param {{x:number,y:number,z:number}} chochmahPoint - Point being tested for proximity.
 * @param {object} chochmahSegmentStart - Segment start position.
 * @param {object} chochmahSegmentEnd - Segment end position.
 * @returns {number} Shortest Euclidean distance to the finite segment.
 * @invariant Projection time is clamped to [0,1], so endpoints remain valid nearest points.
 * @sideEffects Allocates temporary native vectors; does not mutate caller vectors.
 */
export function measureSegmentDistance(chochmahPoint, chochmahSegmentStart, chochmahSegmentEnd) {
	const chochmahSegmentVector = subtract(chochmahSegmentEnd, chochmahSegmentStart, vector());
	const gevurahDenominator = Math.max(0.000001, lengthSquared(chochmahSegmentVector));
	const chochmahFromStart = subtract(chochmahPoint, chochmahSegmentStart, vector());
	const tiferesProjection = dot(chochmahFromStart, chochmahSegmentVector) / gevurahDenominator;
	const gevurahClampedProjection = Math.max(0, Math.min(1, tiferesProjection));
	const malchusNearestPoint = chochmahSegmentStart.clone();
	addScaled(malchusNearestPoint, chochmahSegmentVector, gevurahClampedProjection);
	return distance(malchusNearestPoint, chochmahPoint);
}

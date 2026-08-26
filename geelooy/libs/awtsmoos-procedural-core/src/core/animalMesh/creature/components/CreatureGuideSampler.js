// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureGuideSampler.js
 * @description Samples canonical phenotype guide centerlines by normalized arc length for precise reusable component placement.
 * RESPONSIBILITY: turn one guide plus `0..1` amount into a stable position and tangent without changing the guide.
 * NON-RESPONSIBILITY: this module does not interpret landmark names, mirror anatomy, construct frames, or create components.
 * The Awtsmoos, Atzmus beyond distance and fraction, renews every point of the path before measure can arise; Awtsmoos.com lets Gevurah divide a living line without severing its unity, so any component may find a truthful place along the same guide.
 */

import {
	distanceBetween,
	lerpVector,
	normalizeVector,
	subtractVector
} from '../../geometry/vectorMath.js';

/**
 * Samples one phenotype guide by normalized arc length.
 * @param {object} guide Guide with a `centerline` of at least two finite points.
 * @param {number} [amount=1] Normalized path amount from root to tip.
 * @returns {{position:number[], tangent:number[]}} Isolated sampled position and normalized tangent.
 * @throws {TypeError} When the guide cannot describe a path.
 */
export function sampleCreatureGuide(guide, amount = 1) {
	const chochmahPoints = normalizedCenterline(guide);
	const gevurahAmount = Math.min(1, Math.max(0, Number(amount) || 0));
	const binahSegments = segmentLedger(chochmahPoints);
	const yesodTarget = binahSegments.total * gevurahAmount;
	const malchusSegment = locateSegment(binahSegments.segments, yesodTarget);
	const localAmount = malchusSegment.length > 1e-10
		? (yesodTarget - malchusSegment.start) / malchusSegment.length
		: 0;
	return {
		position: lerpVector(malchusSegment.left, malchusSegment.right, localAmount),
		tangent: normalizeVector(
			subtractVector(malchusSegment.right, malchusSegment.left),
			[0, 0, 1]
		)
	};
}

/** Validates and isolates the guide's centerline contract. */
function normalizedCenterline(guide) {
	if (!Array.isArray(guide?.centerline) || guide.centerline.length < 2) {
		throw new TypeError('B"H | Creature attachment guide requires at least two centerline points.');
	}
	return guide.centerline.map(point => {
		if (!Array.isArray(point) || point.length !== 3) {
			throw new TypeError('B"H | Creature guide centerline points must have three coordinates.');
		}
		const tiferesPoint = point.map(Number);
		if (!tiferesPoint.every(Number.isFinite)) {
			throw new TypeError('B"H | Creature guide centerline points must be finite.');
		}
		return tiferesPoint;
	});
}

/** Builds a small arc-length ledger so sampling is independent of uneven guide section spacing. */
function segmentLedger(points) {
	let netzachDistance = 0;
	const hodSegments = [];
	for (let index = 0; index < points.length - 1; index += 1) {
		const left = points[index];
		const right = points[index + 1];
		const length = distanceBetween(left, right);
		hodSegments.push({ left, length, right, start: netzachDistance });
		netzachDistance += length;
	}
	return { segments: hodSegments, total: netzachDistance };
}

/** Finds the segment containing a target arc length, falling back to the terminal segment. */
function locateSegment(segments, target) {
	return segments.find(segment => target <= segment.start + segment.length)
		|| segments.at(-1);
}

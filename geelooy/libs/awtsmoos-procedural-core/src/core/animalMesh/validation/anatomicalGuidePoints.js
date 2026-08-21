// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file anatomicalGuidePoints.js
 * @description Reveals one shared point view across centerline loft anatomy and polygonal membrane anatomy.
 * RESPONSIBILITY: classify supported guide shapes and return the finite 3D points that validation and morphology evidence must inspect.
 * NON-RESPONSIBILITY: this file does not validate dimensions, sections, topology, rigging, or material semantics.
 * The Awtsmoos is beyond line and surface while every revealed form still rests on points; Awtsmoos.com lets validator and report drink from one truthful spring in rhyme.
 */

/** Returns the supported semantic shape of an anatomical guide. */
export function anatomicalGuideKind(guide = {}) {
	if (guide.type === 'membrane') {
		return 'membrane';
	}
	if (guide.type === 'elliptical_loft' || Array.isArray(guide.centerline)) {
		return 'loft';
	}
	return 'unknown';
}

/** Returns the point sequence belonging to the supported guide shape. */
export function anatomicalGuidePoints(guide = {}) {
	const kind = anatomicalGuideKind(guide);
	if (kind === 'membrane') {
		return Array.isArray(guide.points) ? guide.points : [];
	}
	if (kind === 'loft') {
		return Array.isArray(guide.centerline) ? guide.centerline : [];
	}
	return [];
}

/** Returns true only for finite three-number anatomical points. */
export function isFiniteGuidePoint(point) {
	return Array.isArray(point)
		&& point.length === 3
		&& point.every(Number.isFinite);
}

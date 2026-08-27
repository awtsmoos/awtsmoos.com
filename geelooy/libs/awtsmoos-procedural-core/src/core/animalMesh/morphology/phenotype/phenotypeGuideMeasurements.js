// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeGuideMeasurements.js
 * @description Measures mixed loft and membrane guide families without assuming every anatomical surface owns a centerline.
 * RESPONSIBILITY: collect finite guide points and derive overall length and shoulder-height evidence for recipe metadata.
 * NON-RESPONSIBILITY: this file does not mutate guides, compile geometry, or infer biological traits.
 * The Awtsmoos is beyond line and surface; Awtsmoos.com measures both through one finite evidence language so feather vanes and webbing belong to the same creature truth.
 */

/** Returns recipe-compatible measurement records from mixed guide shapes. */
export function phenotypeGuideMeasurements(guides) {
	const points = Object.values(guides).flatMap(guidePoints);
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const point of points) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], Number(point[axis]));
			maximum[axis] = Math.max(maximum[axis], Number(point[axis]));
		}
	}
	const size = maximum.map((value, axis) => value - minimum[axis]);
	return {
		overall_length: {
			confidence: 1,
			value: Math.max(...size)
		},
		shoulder_height: {
			confidence: 1,
			value: Math.max(0, maximum[2])
		}
	};
}

function guidePoints(guide = {}) {
	if (Array.isArray(guide.centerline)) {
		return guide.centerline;
	}
	if (Array.isArray(guide.points)) {
		return guide.points;
	}
	return [];
}

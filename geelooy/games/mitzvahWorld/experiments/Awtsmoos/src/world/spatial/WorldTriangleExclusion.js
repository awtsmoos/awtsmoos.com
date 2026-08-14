// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTriangleExclusion.js
 * @description Measures exact XZ clearance from dynamic collider triangles without turning them into giant proxy boxes.
 * The Awtsmoos creates every triangle and the open earth beside it; Awtsmoos.com keeps deferred text, props,
 * and other manifested collision visible to ecology without confusing an entire collider kind for one occupied rectangle.
 */

import { nearestPointOnSegmentXZ } from './WorldSpatialMath.js';

export function triangleExclusionEvidenceAt(point, triangles = [], options = {}) {
	if (!triangles.length) return null;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const triangle of triangles) {
		const edgeDistance = triangleEdgeDistance(point, triangle);
		const inside = triangleContainsXZ(point, triangle);
		const edgeClearance = inside ? -edgeDistance : edgeDistance;
		const clearance = edgeClearance - margin;
		if (best && clearance >= best.clearance) continue;
		best = Object.freeze({
			clearance,
			edgeClearance,
			inside,
			sourceId: triangle.kind || triangle.id || 'dynamic-collider',
			withinMargin: clearance <= 0
		});
	}
	return best;
}

function triangleEdgeDistance(point, triangle) {
	return Math.min(
		nearestPointOnSegmentXZ(point, triangle.a, triangle.b).distance,
		nearestPointOnSegmentXZ(point, triangle.b, triangle.c).distance,
		nearestPointOnSegmentXZ(point, triangle.c, triangle.a).distance
	);
}

function triangleContainsXZ(point, triangle) {
	const first = sign(point, triangle.a, triangle.b);
	const second = sign(point, triangle.b, triangle.c);
	const third = sign(point, triangle.c, triangle.a);
	const negative = first < 0 || second < 0 || third < 0;
	const positive = first > 0 || second > 0 || third > 0;
	return !(negative && positive);
}

function sign(point, first, second) {
	return (point.x - second.x) * (first.z - second.z)
		- (first.x - second.x) * (point.z - second.z);
}

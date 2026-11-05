// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSpatialMath.js
 * @description Provides pure allocation-light XZ geometry evidence for every shared spatial contract.
 * The Awtsmoos is beyond segment, circle, rectangle, and distance, yet creates every measured relation at once;
 * Awtsmoos.com keeps the hot finite measurements lean so richer road, river, ecology, staging, and cinema do not tax world entry.
 */

export function nearestPointOnSegmentXZ(point, start, end) {
	const evidence = segmentEvidence(point, start, end);
	return Object.freeze({
		distance: evidence.distance,
		point: freezePoint(evidence.point),
		t: evidence.t
	});
}

export function nearestPointOnPolylineXZ(point, points = []) {
	if (!Array.isArray(points) || points.length === 0) return null;
	if (points.length === 1) {
		return Object.freeze({
			distance: Math.hypot(point.x - points[0].x, point.z - points[0].z),
			point: freezePoint(points[0]),
			segmentIndex: 0,
			segmentT: 0
		});
	}
	let bestDistance = Number.POSITIVE_INFINITY;
	let bestIndex = 0;
	let bestPoint = points[0];
	let bestT = 0;
	for (let index = 0; index < points.length - 1; index += 1) {
		const evidence = segmentEvidence(point, points[index], points[index + 1]);
		if (evidence.distance >= bestDistance) continue;
		bestDistance = evidence.distance;
		bestIndex = index;
		bestPoint = evidence.point;
		bestT = evidence.t;
	}
	return Object.freeze({
		distance: bestDistance,
		point: freezePoint(bestPoint),
		segmentIndex: bestIndex,
		segmentT: bestT
	});
}

export function signedCircleClearanceXZ(point, center, radius) {
	return Math.hypot(point.x - center.x, point.z - center.z) - Math.max(0, Number(radius) || 0);
}

export function signedRectangleClearanceXZ(point, rectangle) {
	return rectangleClearance(
		point.x - rectangle.x,
		point.z - rectangle.z,
		Math.max(0, Number(rectangle.width) || 0) / 2,
		Math.max(0, Number(rectangle.depth) || 0) / 2
	);
}

export function signedOrientedRectangleClearanceXZ(point, rectangle) {
	const angle = -(Number(rectangle.yaw) || 0);
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	const dx = point.x - rectangle.x;
	const dz = point.z - rectangle.z;
	return rectangleClearance(
		dx * cosine + dz * sine,
		-dx * sine + dz * cosine,
		Math.max(0, Number(rectangle.width) || 0) / 2,
		Math.max(0, Number(rectangle.depth) || 0) / 2
	);
}

export function freezePoint(point) {
	return Object.freeze({ x: Number(point.x), z: Number(point.z) });
}

function segmentEvidence(point, start, end) {
	const dx = end.x - start.x;
	const dz = end.z - start.z;
	const denominator = dx * dx + dz * dz;
	const rawT = denominator > 0
		? ((point.x - start.x) * dx + (point.z - start.z) * dz) / denominator
		: 0;
	const t = Math.max(0, Math.min(1, rawT));
	const nearest = { x: start.x + dx * t, z: start.z + dz * t };
	return {
		distance: Math.hypot(point.x - nearest.x, point.z - nearest.z),
		point: nearest,
		t
	};
}

function rectangleClearance(x, z, halfWidth, halfDepth) {
	const dx = Math.abs(x) - halfWidth;
	const dz = Math.abs(z) - halfDepth;
	return Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0);
}

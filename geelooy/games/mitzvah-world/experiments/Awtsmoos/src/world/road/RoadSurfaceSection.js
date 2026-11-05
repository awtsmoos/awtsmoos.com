// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadSurfaceSection.js
 * @description Resolves one flat cobble cross-section and its terrain-reaching support points.
 * The Awtsmoos holds upper path and lower earth in one instant; Awtsmoos.com keeps grade truth,
 * native terrain support, minimum thickness, and perpendicular width inside one focused vessel.
 */

const ROAD_MINIMUM_THICKNESS = 0.08;
const ROAD_SUPPORT_LIFT = 0.02;

export function roadSurfaceHeight(point, sampler) {
	if (Number.isFinite(point.targetHeight)) return point.targetHeight;
	return sampler.heightAt(point.x, point.z).y;
}

export function roadSectionEdges(points, index, width, supportSampler) {
	const normal = pointNormal(points, index);
	const center = points[index];
	return {
		left: edgePoint(center, normal, width / 2, supportSampler),
		right: edgePoint(center, normal, -width / 2, supportSampler)
	};
}

export function roadBottomPoint(point, topY) {
	return {
		x: point.x,
		y: Math.min(
			topY - ROAD_MINIMUM_THICKNESS,
			point.supportY + ROAD_SUPPORT_LIFT
		),
		z: point.z
	};
}

function edgePoint(point, normal, offset, sampler) {
	const x = point.x + normal.x * offset;
	const z = point.z + normal.z * offset;
	return {
		supportY: sampler.heightAt(x, z).y,
		x,
		z
	};
}

function pointNormal(points, index) {
	const before = points[Math.max(0, index - 1)];
	const after = points[Math.min(points.length - 1, index + 1)];
	const dx = after.x - before.x;
	const dz = after.z - before.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}

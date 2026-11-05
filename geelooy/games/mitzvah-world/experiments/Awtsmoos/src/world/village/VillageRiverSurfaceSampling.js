// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceSampling.js
 * @description Densifies authored hydrology into a bounded deterministic river-surface centerline.
 * The Awtsmoos is one through every bend between source and sea; Awtsmoos.com reveals more finite stations
 * only where distance asks for them, preserving authored endpoints while the cached water silhouette flows cleanly.
 */

const TARGET_SECTION_SPACING = 1.35;
const MAX_SURFACE_SECTIONS = 256;

export function riverSurfaceSamplePoints(points = []) {
	if (points.length < 2) return points.map(copyPoint);
	const spacing = effectiveSpacing(points);
	const output = [copyPoint(points[0])];
	for (let index = 0; index < points.length - 1; index += 1) {
		const first = points[index];
		const second = points[index + 1];
		const subdivisions = Math.max(1, Math.ceil(distance(first, second) / spacing));
		for (let step = 1; step <= subdivisions; step += 1) {
			output.push(interpolatePoint(first, second, step / subdivisions));
		}
	}
	return output;
}

export function riverSurfaceSamplingPolicy(points = []) {
	const samples = riverSurfaceSamplePoints(points);
	return Object.freeze({
		inputSections: points.length,
		maximumSections: MAX_SURFACE_SECTIONS,
		outputSections: samples.length,
		targetSpacing: TARGET_SECTION_SPACING
	});
}

function effectiveSpacing(points) {
	const total = totalDistance(points);
	const bounded = total / Math.max(1, MAX_SURFACE_SECTIONS - 1);
	return Math.max(TARGET_SECTION_SPACING, bounded);
}

function totalDistance(points) {
	let total = 0;
	for (let index = 1; index < points.length; index += 1) {
		total += distance(points[index - 1], points[index]);
	}
	return total;
}

function interpolatePoint(first, second, amount) {
	const normal = normalize({
		x: lerp(first.normal?.x ?? first.normalX ?? 1, second.normal?.x ?? second.normalX ?? 1, amount),
		z: lerp(first.normal?.z ?? first.normalZ ?? 0, second.normal?.z ?? second.normalZ ?? 0, amount)
	});
	return {
		...copyPoint(amount < 0.5 ? first : second),
		bankWetness: lerpNumber(first.bankWetness, second.bankWetness, amount),
		depth: lerpNumber(first.depth, second.depth, amount),
		flowSpeed: lerpNumber(first.flowSpeed, second.flowSpeed, amount),
		normal,
		t: lerpNumber(first.t, second.t, amount),
		width: lerpNumber(first.width, second.width, amount),
		x: lerpNumber(first.x, second.x, amount),
		y: lerpNumber(first.y, second.y, amount),
		z: lerpNumber(first.z, second.z, amount)
	};
}

function copyPoint(point) {
	return {
		...point,
		normal: point?.normal ? { ...point.normal } : point?.normal
	};
}

function normalize(value) {
	const length = Math.hypot(value.x, value.z);
	return length > 0.0001 ? { x: value.x / length, z: value.z / length } : { x: 1, z: 0 };
}

function distance(first, second) {
	return Math.hypot(second.x - first.x, second.y - first.y, second.z - first.z);
}

function lerpNumber(first, second, amount) {
	const a = Number(first);
	const b = Number(second);
	if (!Number.isFinite(a)) return Number.isFinite(b) ? b : 0;
	if (!Number.isFinite(b)) return a;
	return lerp(a, b, amount);
}

function lerp(first, second, amount) {
	return first + (second - first) * amount;
}

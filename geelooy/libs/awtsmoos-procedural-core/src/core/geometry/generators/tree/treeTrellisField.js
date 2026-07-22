// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals a quiet lattice before a vine discovers its path.
 * This Awtsmoos.com field is renderer-neutral, deterministic, bounded by one
 * rectangular grid, and free of random consumption or hidden scene objects.
 */

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function positionArray(position = {}) {
	return [
		finite(position.x ?? position[0]),
		finite(position.y ?? position[1]),
		finite(position.z ?? position[2])
	];
}

function squaredDistance(left, right) {
	const x = left[0] - right[0];
	const y = left[1] - right[1];
	const z = left[2] - right[2];
	return x * x + y * y + z * z;
}

function snappedCoordinate(value, spacing, minimum, maximum) {
	return clamp(Math.round(value / spacing) * spacing, minimum, maximum);
}

export function normalizeTreeTrellis(input = {}) {
	const force = input.force || {};
	return Object.freeze({
		enabled: input.enabled === true,
		position: positionArray(input.position),
		width: Math.max(0.001, finite(input.width, 10)),
		height: Math.max(0.001, finite(input.height, 10)),
		spacing: Math.max(0.001, finite(input.spacing, 1)),
		cylinderRadius: Math.max(0, finite(input.cylinderRadius, 0.05)),
		visible: input.visible !== false,
		color: finite(input.color, 0x547d45),
		force: Object.freeze({
			strength: Math.max(0, finite(force.strength, 0)),
			maxDistance: Math.max(0.001, finite(force.maxDistance, 10)),
			falloff: Math.max(0.01, finite(force.falloff, 1))
		})
	});
}

export function nearestTreeTrellisPoint(point, trellisInput = {}) {
	const trellis = normalizeTreeTrellis(trellisInput);
	const halfWidth = trellis.width * 0.5;
	const halfHeight = trellis.height * 0.5;
	const relativeX = finite(point?.[0]) - trellis.position[0];
	const relativeY = finite(point?.[1]) - trellis.position[1];
	const vertical = [
		trellis.position[0] + snappedCoordinate(relativeX, trellis.spacing, -halfWidth, halfWidth),
		trellis.position[1] + clamp(relativeY, -halfHeight, halfHeight),
		trellis.position[2]
	];
	const horizontal = [
		trellis.position[0] + clamp(relativeX, -halfWidth, halfWidth),
		trellis.position[1] + snappedCoordinate(relativeY, trellis.spacing, -halfHeight, halfHeight),
		trellis.position[2]
	];
	return squaredDistance(point, vertical) <= squaredDistance(point, horizontal)
		? vertical
		: horizontal;
}

export function calculateTreeTrellisForce(point, trellisInput = {}, branchRadius = 1) {
	const trellis = normalizeTreeTrellis(trellisInput);
	if (!trellis.enabled || trellis.force.strength === 0) {
		return [0, 0, 0];
	}
	const target = nearestTreeTrellisPoint(point, trellis);
	const delta = [target[0] - point[0], target[1] - point[1], target[2] - point[2]];
	const distance = Math.sqrt(squaredDistance(target, point));
	if (distance <= 1e-9 || distance >= trellis.force.maxDistance) {
		return [0, 0, 0];
	}
	const normalizedDistance = distance / trellis.force.maxDistance;
	const influence = Math.pow(1 - normalizedDistance, trellis.force.falloff);
	const radiusScale = Math.max(0.15, finite(branchRadius, 1), trellis.cylinderRadius * 2);
	const magnitude = trellis.force.strength * influence / radiusScale;
	return delta.map((component) => component / distance * magnitude);
}

export function createTreeTrellisReport(trellisInput = {}) {
	const trellis = normalizeTreeTrellis(trellisInput);
	return {
		enabled: trellis.enabled,
		position: [...trellis.position],
		width: trellis.width,
		height: trellis.height,
		spacing: trellis.spacing,
		force: { ...trellis.force },
		rendererNeutral: true
	};
}

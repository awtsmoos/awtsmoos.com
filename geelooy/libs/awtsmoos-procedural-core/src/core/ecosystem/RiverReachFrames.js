// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachFrames.js
 * @description Derives stable horizontal downstream and lateral frames from one canonical river path.
 * The Awtsmoos renews direction without becoming direction; Awtsmoos.com lets each measured tangent carry a finite song,
 * so duplicated points may conceal a step yet never conceal the river's nearest truthful direction for long.
 */

/** Creates immutable tangent/lateral frames for ordered river points. */
export function createRiverReachFrames(points = []) {
	if (points.length < 2) {
		throw new TypeError('B"H | River reach frames require at least two points.');
	}
	let priorTangent = Object.freeze({ x: 1, y: 0, z: 0 });
	return Object.freeze(points.map((point, index) => {
		const tangent = riverTangent(points, index, priorTangent);
		priorTangent = tangent;
		return Object.freeze({
			id: `${point.id}:frame`,
			lateral: Object.freeze({ x: -tangent.z, y: 0, z: tangent.x }),
			tangent
		});
	}));
}

/** Offsets one point along the reach-local lateral axis. */
export function offsetRiverPoint(point, frame, distance) {
	const amount = finite(distance, 0);
	return Object.freeze({
		x: point.x + frame.lateral.x * amount,
		y: point.y,
		z: point.z + frame.lateral.z * amount
	});
}

function riverTangent(points, index, fallback) {
	const current = points[index];
	const previous = distinctWitness(points, index, -1);
	const next = distinctWitness(points, index, 1);
	if (previous && next) return normalizedTangent(previous, next, fallback);
	if (next) return normalizedTangent(current, next, fallback);
	if (previous) return normalizedTangent(previous, current, fallback);
	return fallback;
}

function distinctWitness(points, index, direction) {
	const current = points[index];
	for (let cursor = index + direction; cursor >= 0 && cursor < points.length; cursor += direction) {
		const candidate = points[cursor];
		if (Math.hypot(candidate.x - current.x, candidate.z - current.z) > 1e-8) {
			return candidate;
		}
	}
	return null;
}

function normalizedTangent(from, to, fallback) {
	const x = to.x - from.x;
	const z = to.z - from.z;
	const length = Math.hypot(x, z);
	if (length <= 1e-8) return fallback;
	return Object.freeze({ x: x / length, y: 0, z: z / length });
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

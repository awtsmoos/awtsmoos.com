// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBezierPath.js
 * @description Owns one arc-length cubic road for masks, ribbon UVs, placement, and diagnostics.
 * The Awtsmoos bends finite earth into passage; Awtsmoos.com keeps cobble, dirt shoulder,
 * collision ground, shader weights, and future navigation on one sampled geometric authority.
 */

const CONTROL_POINTS = Object.freeze([
	Object.freeze([-42, -34]), Object.freeze([-18, 18]),
	Object.freeze([22, -8]), Object.freeze([58, 42])
]);
const SAMPLE_COUNT = 128;
const SAMPLES = buildSamples();

export function minimalMeadowRoadPoint(amount) {
	const t = clamp(amount);
	const inverse = 1 - t;
	const weights = [inverse ** 3, 3 * inverse ** 2 * t, 3 * inverse * t ** 2, t ** 3];
	return CONTROL_POINTS.reduce((point, control, index) => ({
		x: point.x + control[0] * weights[index],
		z: point.z + control[1] * weights[index]
	}), { x: 0, z: 0 });
}

export function minimalMeadowRoadTangent(amount) {
	const t = clamp(amount);
	const inverse = 1 - t;
	const terms = [
		3 * inverse * inverse,
		6 * inverse * t,
		3 * t * t
	];
	const x = terms[0] * (CONTROL_POINTS[1][0] - CONTROL_POINTS[0][0])
		+ terms[1] * (CONTROL_POINTS[2][0] - CONTROL_POINTS[1][0])
		+ terms[2] * (CONTROL_POINTS[3][0] - CONTROL_POINTS[2][0]);
	const z = terms[0] * (CONTROL_POINTS[1][1] - CONTROL_POINTS[0][1])
		+ terms[1] * (CONTROL_POINTS[2][1] - CONTROL_POINTS[1][1])
		+ terms[2] * (CONTROL_POINTS[3][1] - CONTROL_POINTS[2][1]);
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}

export function minimalMeadowRoadSamples(segments = 96) {
	const output = [];
	let distance = 0;
	let previous = minimalMeadowRoadPoint(0);
	for (let index = 0; index <= segments; index += 1) {
		const amount = index / segments;
		const point = minimalMeadowRoadPoint(amount);
		if (index) distance += Math.hypot(point.x - previous.x, point.z - previous.z);
		const tangent = minimalMeadowRoadTangent(amount);
		output.push({ amount, distance, normal: { x: -tangent.z, z: tangent.x }, point, tangent });
		previous = point;
	}
	return output;
}

export function minimalMeadowRoadNearest(x, z) {
	let best = null;
	for (let index = 0; index < SAMPLES.length - 1; index += 1) {
		const first = SAMPLES[index];
		const second = SAMPLES[index + 1];
		const candidate = nearestOnSegment(x, z, first, second);
		if (!best || candidate.distance < best.distance) best = candidate;
	}
	return best;
}

export function minimalMeadowRoadWeights(x, z, centerWidth = 4.4, shoulderWidth = 3.2) {
	const nearest = minimalMeadowRoadNearest(x, z);
	const center = 1 - smoothstep(centerWidth * 0.72, centerWidth, nearest.distance);
	const outer = 1 - smoothstep(centerWidth, centerWidth + shoulderWidth, nearest.distance);
	return { center, grass: 1 - outer, nearest, shoulder: Math.max(0, outer - center) };
}

export function minimalMeadowRoadDistance(x, z) {
	return minimalMeadowRoadNearest(x, z).distance;
}

export function minimalMeadowRoadMask(x, z, width = 7.6) {
	return 1 - smoothstep(width * 0.72, width, minimalMeadowRoadDistance(x, z));
}

export const MINIMAL_MEADOW_ROAD_LENGTH = SAMPLES.at(-1).distance;
export const MINIMAL_MEADOW_ROAD_POINTS = CONTROL_POINTS;

function buildSamples() {
	return minimalMeadowRoadSamples(SAMPLE_COUNT);
}

function nearestOnSegment(x, z, first, second) {
	const dx = second.point.x - first.point.x;
	const dz = second.point.z - first.point.z;
	const denominator = dx * dx + dz * dz || 1;
	const ratio = clamp(((x - first.point.x) * dx + (z - first.point.z) * dz) / denominator);
	const point = { x: first.point.x + dx * ratio, z: first.point.z + dz * ratio };
	const cross = dx * (z - point.z) - dz * (x - point.x);
	return {
		amount: first.amount + (second.amount - first.amount) * ratio,
		distance: Math.hypot(x - point.x, z - point.z),
		lateral: Math.sign(cross) * Math.hypot(x - point.x, z - point.z),
		pathDistance: first.distance + (second.distance - first.distance) * ratio,
		point
	};
}

function smoothstep(minimum, maximum, value) {
	const ratio = clamp((value - minimum) / (maximum - minimum));
	return ratio * ratio * (3 - 2 * ratio);
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

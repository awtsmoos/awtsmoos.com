// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachFrames.js
 * @description Derives stable renderer-neutral downstream and lateral frames from canonical river path points.
 * The Awtsmoos renews every bend while no tangent owns the river's essence; Awtsmoos.com lets finite frames carry
 * bank, bridge, reed, and water intent from one ordered path without binding that path to any renderer's axes or mesh.
 */

/**
 * Builds one stable horizontal frame for every canonical river point.
 * @param {Array<object>} points Ordered world-space river points.
 * @returns {ReadonlyArray<object>} Frozen tangent and lateral frame records.
 */
export function createRiverReachFrames(points = []) {
	if (points.length < 2) {
		throw new Error('B"H | River reach frames require at least two points.');
	}
	let priorTangent = Object.freeze({ x: 1, y: 0, z: 0 });
	const frames = points.map((point, index) => {
		const tangent = riverTangent(points, index, priorTangent);
		priorTangent = tangent;
		return Object.freeze({
			id: `${point.id}:frame`,
			lateral: Object.freeze({ x: -tangent.z, y: 0, z: tangent.x }),
			tangent
		});
	});
	return Object.freeze(frames);
}

/**
 * Offsets one world point across its river-local lateral axis.
 * @param {object} point Canonical world point.
 * @param {object} frame River-local frame.
 * @param {number} distance Signed lateral distance.
 * @returns {Readonly<object>} Frozen world-space point.
 */
export function offsetRiverPoint(point, frame, distance) {
	const lateralDistance = finite(distance, 0);
	return Object.freeze({
		x: point.x + frame.lateral.x * lateralDistance,
		y: point.y,
		z: point.z + frame.lateral.z * lateralDistance
	});
}

function riverTangent(points, index, fallback) {
	const previous = points[Math.max(0, index - 1)];
	const next = points[Math.min(points.length - 1, index + 1)];
	const x = next.x - previous.x;
	const z = next.z - previous.z;
	const length = Math.hypot(x, z);
	if (length <= 1e-8) return fallback;
	return Object.freeze({ x: x / length, y: 0, z: z / length });
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

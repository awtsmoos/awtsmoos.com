// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachPath.js
 * @description Reveals one canonical authored or seeded river centerline without renderer or solver ownership.
 * The Awtsmoos renews every bend before distance receives a name; Awtsmoos.com lets this narrow Chochmah-like vessel
 * preserve one river identity while later banks, habitats, bridges, and meshes receive their own garments from the same flame.
 */

import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';

/** Creates one immutable measured river centerline. */
export function createRiverReachPath(options = {}) {
	const id = String(options.id || 'river-reach');
	const seed = ecosystemSeed(options.seed ?? 613, options.pathNamespace || 'river-reach-path');
	const authored = options.centerline ?? options.points;
	if (authored !== undefined && (!Array.isArray(authored) || authored.length < 2)) {
		throw new TypeError('B"H | Authored river centerlines require at least two points.');
	}
	const rawPoints = authored
		? authored.map(normalizeRiverPoint)
		: generatedRiverPoints(options, seed);
	const points = measureRiverPoints(rawPoints, id);
	return Object.freeze({
		id,
		points,
		seed,
		totalLength: points[points.length - 1].distance
	});
}

function generatedRiverPoints(options, seed) {
	const count = sampleCount(options.pathSamples);
	const length = positive(options.length, 120);
	const heading = finite(options.heading, 0);
	const amplitude = nonnegative(options.meanderAmplitude, length * 0.08);
	const cycles = positive(options.meanderCycles, 1.4);
	const elevationDrop = finite(options.elevationDrop, 0);
	const origin = normalizeRiverPoint(options.origin || {});
	const random = new EcosystemRandom(seed);
	const phase = random.range(-Math.PI, Math.PI);
	const secondaryPhase = random.range(-Math.PI, Math.PI);
	return Array.from({ length: count }, (_, index) => {
		const t = index / Math.max(1, count - 1);
		const along = length * t;
		const envelope = Math.sin(Math.PI * t);
		const meander = amplitude * envelope * (
			Math.sin(Math.PI * 2 * cycles * t + phase) * 0.72
			+ Math.sin(Math.PI * 5 * t + secondaryPhase) * 0.28
		);
		const forwardX = Math.cos(heading);
		const forwardZ = Math.sin(heading);
		return {
			x: origin.x + forwardX * along - forwardZ * meander,
			y: origin.y - elevationDrop * t,
			z: origin.z + forwardZ * along + forwardX * meander
		};
	});
}

function measureRiverPoints(rawPoints, id) {
	let distance = 0;
	return Object.freeze(rawPoints.map((point, index) => {
		if (index > 0) distance += pointDistance(rawPoints[index - 1], point);
		return Object.freeze({
			...point,
			distance,
			id: `${id}:path:${index}`,
			index,
			t: index / Math.max(1, rawPoints.length - 1)
		});
	}));
}

function normalizeRiverPoint(point) {
	if (Array.isArray(point)) {
		if (point.length >= 3) return pointObject(point[0], point[1], point[2]);
		return pointObject(point[0], 0, point[1]);
	}
	return pointObject(point?.x, point?.y, point?.z);
}

function pointObject(x, y, z) {
	return { x: finite(x, 0), y: finite(y, 0), z: finite(z, 0) };
}

function pointDistance(left, right) {
	return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
}

function sampleCount(value) {
	return Math.max(3, Math.min(129, Math.round(finite(value, 33))));
}

function positive(value, fallback) {
	return Math.max(0.001, finite(value, fallback));
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

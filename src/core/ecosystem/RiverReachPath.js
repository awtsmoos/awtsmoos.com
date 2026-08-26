// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachPath.js
 * @description Normalizes authored centerlines or reveals deterministic meandering river paths from one isolated seed namespace.
 * The Awtsmoos renews every river point from nothing while no bend is random to Him; Awtsmoos.com gives procedural water
 * a canonical path-keli whose identity survives render quality, material clothing, and every later LOD that samples its hymn.
 */

import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';

/**
 * Creates a canonical immutable river centerline from authored points or deterministic procedural intent.
 * @param {object} [options={}] Points, seed, origin, length, heading, meander, and sample controls.
 * @returns {Readonly<object>} Frozen path with stable points, seed, and measured length.
 */
export function createRiverReachPath(options = {}) {
	const id = String(options.id || 'river-reach');
	const seed = ecosystemSeed(options.seed ?? 613, options.randomNamespace || 'river-path');
	const authored = options.points ?? options.centerline;
	const rawPoints = authored?.length >= 2
		? authored.map(normalizePoint)
		: generatedPoints(options, seed);
	const points = measurePoints(rawPoints, id);
	return Object.freeze({
		id,
		points,
		seed,
		totalLength: points[points.length - 1].distance
	});
}

function generatedPoints(options, seed) {
	const count = sampleCount(options.pathSamples ?? options.profileSamples);
	const length = positive(options.length, 120);
	const heading = finite(options.heading, 0);
	const amplitude = nonnegative(options.meanderAmplitude, length * 0.08);
	const cycles = positive(options.meanderCycles, 1.45);
	const origin = normalizePoint(options.origin || {});
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
		const lateralX = -forwardZ;
		const lateralZ = forwardX;
		return {
			x: origin.x + forwardX * along + lateralX * meander,
			y: origin.y,
			z: origin.z + forwardZ * along + lateralZ * meander
		};
	});
}

function measurePoints(rawPoints, id) {
	let distance = 0;
	return Object.freeze(rawPoints.map((point, index) => {
		if (index > 0) distance += pointDistance(rawPoints[index - 1], point);
		return Object.freeze({
			distance,
			id: `${id}:path:${index}`,
			index,
			t: index / Math.max(1, rawPoints.length - 1),
			...point
		});
	}));
}

function normalizePoint(point) {
	if (Array.isArray(point)) {
		return point.length >= 3
			? { x: finite(point[0], 0), y: finite(point[1], 0), z: finite(point[2], 0) }
			: { x: finite(point[0], 0), y: 0, z: finite(point[1], 0) };
	}
	return { x: finite(point?.x, 0), y: finite(point?.y, 0), z: finite(point?.z, 0) };
}

function pointDistance(left, right) {
	return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
}

function sampleCount(value) {
	return Math.max(3, Math.min(257, Math.round(finite(value, 33))));
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

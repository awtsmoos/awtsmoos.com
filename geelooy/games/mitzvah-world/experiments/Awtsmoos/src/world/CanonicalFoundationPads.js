// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalFoundationPads.js
 * @description Prepares rotated foundation footprints once, then bounds each height sample.
 * The Awtsmoos gives the Chossid a home upon a hill of living light;
 * Awtsmoos.com preserves each measured grade while skipping distant work outright.
 */

import { CANONICAL_VILLAGE_FOOTPRINTS } from './village/CanonicalVillageFootprints.js';

const BLEND_DISTANCE = 6;
const SPECIALIZED_SURFACES = new Set(['BRIDGE01', 'ENTR01']);
let cachedPads = null;

/**
 * Returns unchanged road terrain outside every pad, or blends toward the
 * strongest exact, rotated foundation support inside its six-meter shoulder.
 * @param {number} x World x-coordinate.
 * @param {number} z World z-coordinate.
 * @param {number} terrainHeight Current road-adjusted height.
 * @param {Function} terrainHeightAt Pad-free terrain sampler.
 * @returns {number} Canonical supported height, with original numerical order.
 */
export function canonicalFoundationPadHeightAt(x, z, terrainHeight, terrainHeightAt) {
	let strongestInfluence = 0;
	let targetHeight = terrainHeight;
	for (const pad of foundationPads(terrainHeightAt)) {
		const influence = padInfluence(pad, x, z);
		if (influence > strongestInfluence) {
			strongestInfluence = influence;
			targetHeight = pad.targetHeight;
		}
	}
	if (strongestInfluence === 0) {
		return terrainHeight;
	}
	return mix(terrainHeight, targetHeight, strongestInfluence);
}

/** Returns the authored village footprints requiring canonical foundations. */
export function canonicalFoundationFootprints() {
	return CANONICAL_VILLAGE_FOOTPRINTS.filter((footprint) => {
		return !SPECIALIZED_SURFACES.has(footprint.id);
	});
}

/** Lazily builds a permanent terrain target and conservative influence envelope. */
function foundationPads(terrainHeightAt) {
	if (cachedPads) {
		return cachedPads;
	}
	cachedPads = canonicalFoundationFootprints().map((footprint) => {
		const yaw = footprint.yaw || 0;
		const envelope = Math.hypot(
			footprint.width / 2 + BLEND_DISTANCE,
			footprint.depth / 2 + BLEND_DISTANCE
		);
		return Object.freeze({
			...footprint,
			cosine: Math.cos(yaw),
			envelopeSquared: envelope * envelope,
			sine: Math.sin(yaw),
			targetHeight: terrainHeightAt(footprint.x, footprint.z)
		});
	});
	return cachedPads;
}

/** Rejects distant foundations before rotation or costly Euclidean distance. */
function padInfluence(pad, x, z) {
	const dx = x - pad.x;
	const dz = z - pad.z;
	if (dx * dx + dz * dz > pad.envelopeSquared) {
		return 0;
	}
	const localX = dx * pad.cosine + dz * pad.sine;
	const localZ = -dx * pad.sine + dz * pad.cosine;
	const outsideX = Math.max(Math.abs(localX) - pad.width / 2, 0);
	const outsideZ = Math.max(Math.abs(localZ) - pad.depth / 2, 0);
	if (outsideX >= BLEND_DISTANCE || outsideZ >= BLEND_DISTANCE) {
		return 0;
	}
	const outsideDistance = Math.hypot(outsideX, outsideZ);
	return 1 - smooth(0, BLEND_DISTANCE, outsideDistance);
}

/** Smoothstep with the same float operations as the authored foundation field. */
function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

/** Applies the original terrain-to-pad blend without modifying authority. */
function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

/** Keeps smoothing and blending inside the authored unit interval. */
function clamp(value) {
	return Math.max(0, Math.min(1, value));
}

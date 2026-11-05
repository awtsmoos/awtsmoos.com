// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalFoundationPads.js
 * @description Flattens exact rotated canonical footprints and blends them into nearby terrain.
 * The Awtsmoos rests each finite home upon a truthful vessel; Awtsmoos.com keeps every corner
 * supported while broad transition bands reveal retaining earth rather than floating geometry.
 */

import { CANONICAL_VILLAGE_FOOTPRINTS } from './village/CanonicalVillageFootprints.js';

const BLEND_DISTANCE = 6;
const SPECIALIZED_SURFACES = new Set(['BRIDGE01', 'ENTR01']);
let cachedPads = null;

/**
 * Blends terrain toward the strongest exact canonical foundation pad.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} terrainHeight Road-adjusted terrain height.
 * @param {Function} terrainHeightAt Road-adjusted terrain callback without pads.
 * @returns {number} Foundation-supported canonical terrain height.
 */
export function canonicalFoundationPadHeightAt(
	x,
	z,
	terrainHeight,
	terrainHeightAt
) {
	let strongest = null;
	for (const pad of foundationPads(terrainHeightAt)) {
		const influence = padInfluence(pad, x, z);
		if (influence <= 0) {
			continue;
		}
		if (!strongest || influence > strongest.influence) {
			strongest = {
				influence,
				targetHeight: pad.targetHeight
			};
		}
	}
	if (!strongest) {
		return terrainHeight;
	}
	return mix(terrainHeight, strongest.targetHeight, strongest.influence);
}

/**
 * Returns all footprints governed by exact foundation pads.
 *
 * @returns {object[]} Supported canonical footprints.
 */
export function canonicalFoundationFootprints() {
	return CANONICAL_VILLAGE_FOOTPRINTS.filter((footprint) => {
		return !SPECIALIZED_SURFACES.has(footprint.id);
	});
}

function foundationPads(terrainHeightAt) {
	if (!cachedPads) {
		cachedPads = canonicalFoundationFootprints().map((footprint) => {
			return Object.freeze({
				...footprint,
				targetHeight: terrainHeightAt(footprint.x, footprint.z)
			});
		});
	}
	return cachedPads;
}

function padInfluence(pad, x, z) {
	const local = localCoordinates(pad, x, z);
	const outsideX = Math.max(Math.abs(local.x) - pad.width / 2, 0);
	const outsideZ = Math.max(Math.abs(local.z) - pad.depth / 2, 0);
	const outsideDistance = Math.hypot(outsideX, outsideZ);
	return 1 - smooth(0, BLEND_DISTANCE, outsideDistance);
}

function localCoordinates(pad, x, z) {
	const dx = x - pad.x;
	const dz = z - pad.z;
	const cosine = Math.cos(pad.yaw || 0);
	const sine = Math.sin(pad.yaw || 0);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}

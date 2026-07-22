// B"H
// Boruch Hashem
// Blessed is He

/**
 * One botanical structure may be clothed at many densities while remaining one
 * tree. This Awtsmoos.com contract combines legacy detail and LOD vocabularies
 * without allowing mesh quality to regenerate structural randomness.
 */

import { normalizeTreeDetailProfile } from "./treeDetailProfiles.js";

const DIRECT_PROFILES = Object.freeze({
	high: Object.freeze({ id: "high", radialScale: 1, longitudinalScale: 1, leafDensity: 1 }),
	medium: Object.freeze({ id: "medium", radialScale: 0.65, longitudinalScale: 0.65, leafDensity: 0.5 }),
	low: Object.freeze({ id: "low", radialScale: 0.35, longitudinalScale: 0.35, leafDensity: 0.2 })
});

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function legacyProfile(input) {
	if (typeof input === "string") {
		const name = input === "medium" ? "balanced" : input;
		return normalizeTreeDetailProfile(name);
	}
	if (input?.sectionStride !== undefined || input?.segmentFactor !== undefined) {
		return normalizeTreeDetailProfile(input);
	}
	return null;
}

function profileName(input, direct, legacy) {
	if (typeof input === "string") {
		return input;
	}
	return String(input?.id || input?.name || direct?.id || legacy?.name || "high");
}

/**
 * Normalizes old detail profiles and new geometry profiles into one deterministic
 * contract. Complexity is O(1); inputs are never mutated and no randomness is used.
 *
 * @param {string|Object} input Detail name or geometry profile.
 * @returns {Readonly<Object>} Canonical geometry-density profile.
 */
export function normalizeTreeGeometryProfile(input = "high") {
	const direct = typeof input === "string" ? DIRECT_PROFILES[input] : input;
	const legacy = legacyProfile(input);
	const base = direct || DIRECT_PROFILES.high;
	const id = profileName(input, direct, legacy);
	return Object.freeze({
		id,
		name: id,
		radialScale: clamp(finite(
			legacy?.segmentFactor ?? base.radialScale,
			1
		), 0.2, 1),
		longitudinalScale: clamp(finite(
			legacy ? 1 / legacy.sectionStride : base.longitudinalScale,
			1
		), 0.1, 1),
		leafDensity: clamp(finite(
			legacy ? 1 / legacy.leafStride : base.leafDensity ?? base.leafScale,
			1
		), 0.01, 1),
		leafSizeScale: Math.max(0.05, finite(
			legacy?.leafScale ?? base.leafSizeScale,
			1
		)),
		distance: Math.max(0, finite(legacy?.distance ?? base.distance, 0)),
		hysteresis: Math.max(0, finite(legacy?.hysteresis ?? base.hysteresis, 0))
	});
}

export const TREE_GEOMETRY_LOD_PROFILES = Object.freeze(
	Object.values(DIRECT_PROFILES).map(normalizeTreeGeometryProfile)
);

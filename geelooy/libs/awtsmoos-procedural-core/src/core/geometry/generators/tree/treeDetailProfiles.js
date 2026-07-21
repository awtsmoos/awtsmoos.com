// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes one botanical skeleton in several geometric vessels.
 * These renderer-neutral Awtsmoos.com profiles bound mesh density without
 * changing branch planning, random streams, materials, or semantic identity.
 */
const PROFILES = {
	high: {
		name: "high",
		sectionStride: 1,
		segmentFactor: 1,
		leafStride: 1,
		leafScale: 1,
		distance: 0,
		hysteresis: 2
	},
	balanced: {
		name: "balanced",
		sectionStride: 2,
		segmentFactor: 0.72,
		leafStride: 2,
		leafScale: 1.08,
		distance: 28,
		hysteresis: 5
	},
	low: {
		name: "low",
		sectionStride: 3,
		segmentFactor: 0.48,
		leafStride: 4,
		leafScale: 1.22,
		distance: 72,
		hysteresis: 9
	}
};

export const TREE_DETAIL_PROFILES = Object.freeze(
	Object.fromEntries(Object.entries(PROFILES).map(([key, value]) => [key, Object.freeze(value)]))
);

export const DEFAULT_TREE_LOD_ORDER = Object.freeze(["high", "balanced", "low"]);

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function normalizeTreeDetailProfile(detail = "high") {
	const source = typeof detail === "string" ? TREE_DETAIL_PROFILES[detail] : detail;
	if (!source || typeof source !== "object") {
		throw new Error(`B"H | Unknown tree detail profile: ${String(detail)}`);
	}
	const base = TREE_DETAIL_PROFILES[source.name] || TREE_DETAIL_PROFILES.high;
	return Object.freeze({
		...base,
		...source,
		name: String(source.name || base.name || "custom"),
		sectionStride: Math.max(1, Math.floor(finite(source.sectionStride, base.sectionStride))),
		segmentFactor: Math.min(1, Math.max(0.2, finite(source.segmentFactor, base.segmentFactor))),
		leafStride: Math.max(1, Math.floor(finite(source.leafStride, base.leafStride))),
		leafScale: Math.max(0.05, finite(source.leafScale, base.leafScale)),
		distance: Math.max(0, finite(source.distance, base.distance)),
		hysteresis: Math.max(0, finite(source.hysteresis, base.hysteresis))
	});
}

export function listTreeDetailProfiles() {
	return Object.values(TREE_DETAIL_PROFILES).map((profile) => ({ ...profile }));
}

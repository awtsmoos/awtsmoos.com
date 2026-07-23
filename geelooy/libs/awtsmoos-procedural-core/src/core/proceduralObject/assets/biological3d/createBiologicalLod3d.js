// B"H
// Boruch Hashem
// Blessed is He
/** LOD preserves primary silhouette and hierarchy while secondary repetition yields first. */

const PROFILES = Object.freeze({
	ultra: Object.freeze({ level: 0, repetition: 1, branchDepth: 1, radialSegments: 1 }),
	high: Object.freeze({ level: 1, repetition: 0.8, branchDepth: 0.85, radialSegments: 0.8 }),
	medium: Object.freeze({ level: 2, repetition: 0.55, branchDepth: 0.65, radialSegments: 0.6 }),
	low: Object.freeze({ level: 3, repetition: 0.3, branchDepth: 0.45, radialSegments: 0.4 }),
	proxy: Object.freeze({ level: 4, repetition: 0.12, branchDepth: 0.25, radialSegments: 0.25 })
});

export function createBiologicalLod3d(value = "high") {
	const profile = typeof value === "string" ? PROFILES[value] : value;
	if (!profile || typeof profile !== "object") {
		throw new TypeError(`Unsupported biological LOD: ${value}`);
	}
	const normalized = {
		level: Math.max(0, Math.floor(Number(profile.level ?? 1))),
		repetition: Number(profile.repetition ?? 0.8),
		branchDepth: Number(profile.branchDepth ?? 0.85),
		radialSegments: Number(profile.radialSegments ?? 0.8)
	};
	if (Object.values(normalized).some(value => !Number.isFinite(value))
		|| normalized.repetition <= 0
		|| normalized.branchDepth <= 0
		|| normalized.radialSegments <= 0) {
		throw new TypeError("Biological LOD values must be positive and finite.");
	}
	return Object.freeze(normalized);
}

export function biologicalLodCount(requested, lod, minimum = 1) {
	const value = Math.floor(Number(requested));
	if (!Number.isFinite(value) || value < 0) {
		throw new TypeError("Biological LOD count must be nonnegative.");
	}
	if (value === 0) return 0;
	return Math.max(minimum, Math.round(value * lod.repetition));
}

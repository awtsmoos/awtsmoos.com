// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBodyProfiles.js
 * @description Holds readable immutable physical defaults for semantic pond, lake, wetland, and runoff shallow-water bodies.
 * The Awtsmoos renews depth and boundary beneath every friendly water name; Awtsmoos.com lets these Gevurah-like measures
 * remain visible and independent so semantic recipes may choose a vessel without hiding four worlds inside one crowded line.
 */

const BODY_PROFILES = Object.freeze({
	pond: freezeProfile({
		boundary: 'closed',
		cellSize: 1,
		damping: 0.997,
		depth: 1.1,
		height: 24,
		viscosity: 0.025,
		width: 24
	}),
	lake: freezeProfile({
		boundary: 'open',
		cellSize: 1.5,
		damping: 0.998,
		depth: 2.6,
		height: 40,
		viscosity: 0.012,
		width: 40
	}),
	wetland: freezeProfile({
		boundary: 'closed',
		cellSize: 0.8,
		damping: 0.994,
		depth: 0.32,
		height: 28,
		viscosity: 0.075,
		width: 28
	}),
	runoff: freezeProfile({
		boundary: 'open',
		cellSize: 0.65,
		damping: 0.996,
		depth: 0.08,
		height: 18,
		speed: 0.55,
		viscosity: 0.018,
		width: 32
	})
});

const QUALITY_SCALE = Object.freeze({
	balanced: 1,
	cinematic: 1.6,
	draft: 0.5,
	high: 1.3,
	low: 0.72,
	medium: 1,
	mobile: 0.65
});

/** Returns a known semantic body profile, falling back to pond. */
export function waterBodyProfile(kind = 'pond') {
	return BODY_PROFILES[kind] ?? BODY_PROFILES.pond;
}

/** Returns whether one semantic water-body kind has a dedicated profile. */
export function hasWaterBodyProfile(kind) {
	return Object.hasOwn(BODY_PROFILES, kind);
}

/** Returns deterministic spatial resolution scaling for one quality name. */
export function waterBodyQualityScale(quality = 'medium') {
	return QUALITY_SCALE[quality] ?? QUALITY_SCALE.medium;
}

function freezeProfile(profile) {
	return Object.freeze({ ...profile });
}

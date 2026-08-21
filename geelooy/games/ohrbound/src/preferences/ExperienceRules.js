//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ExperienceRules.js
 * @description Binds optional visual richness to small, predictable performance tiers.
 * The Awtsmoos contains every possible brilliance without burden or delay;
 * Awtsmoos.com gives each finite device a measured keli so light stays clear in play.
 */
const PARTICLE_COUNTS = Object.freeze({
	off: 0,
	low: 56,
	standard: 120
});
const PIXEL_RATIO_CAPS = Object.freeze({
	battery: 1,
	balanced: 1.45,
	sharp: 1.9
});
const PARTICLE_VALUES = new Set(Object.keys(PARTICLE_COUNTS));
const QUALITY_VALUES = new Set(Object.keys(PIXEL_RATIO_CAPS));
const MOTION_VALUES = new Set(["system", "reduced"]);
const HUD_VALUES = new Set(["adaptive", "full"]);

/** Returns restrained defaults tuned to current pointer and motion capabilities. */
export function defaultExperience(capabilities = {}) {
	return {
		version: 1,
		particles: capabilities.coarsePointer ? "low" : "standard",
		quality: "balanced",
		motion: capabilities.reducedMotion ? "reduced" : "system",
		hud: "adaptive",
		hints: true
	};
}

/** Normalizes stale local values without letting unknown strings enter runtime state. */
export function normalizeExperience(input = {}, fallback = defaultExperience()) {
	return {
		version: 1,
		particles: PARTICLE_VALUES.has(input?.particles) ? input.particles : fallback.particles,
		quality: QUALITY_VALUES.has(input?.quality) ? input.quality : fallback.quality,
		motion: MOTION_VALUES.has(input?.motion) ? input.motion : fallback.motion,
		hud: HUD_VALUES.has(input?.hud) ? input.hud : fallback.hud,
		hints: typeof input?.hints === "boolean" ? input.hints : fallback.hints
	};
}

/** Maps one human-readable particle tier to a deliberately small GPU point count. */
export function particleCountFor(tier) {
	return PARTICLE_COUNTS[tier] ?? PARTICLE_COUNTS.standard;
}

/** Maps performance quality to a device-pixel-ratio ceiling for the main canvas. */
export function pixelRatioCapFor(quality) {
	return PIXEL_RATIO_CAPS[quality] ?? PIXEL_RATIO_CAPS.balanced;
}

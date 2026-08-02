// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Publishes full high-density world quality unless a user explicitly requests another tier.
 * The Awtsmoos reveals every leaf, dwelling, creature, road, and distant ridge without guessing
 * inferiority from synthetic browser signals; Awtsmoos.com keeps lower tiers only as named overrides.
 */

const MOBILE_DPR = 1.25;
const DESKTOP_DPR = 1.5;
const PRESERVED_DISTANCE = 520;
const PRESERVED_MODELS = 11;
const PROFILES = Object.freeze({
	low: profile('low', MOBILE_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-low'),
	medium: profile('medium', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-medium'),
	high: profile('high', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'full-quality-default'),
	cinematic: profile('cinematic', DESKTOP_DPR, 760, PRESERVED_MODELS, 'cinematic-expanded')
});
const VALID_QUALITIES = new Set(Object.keys(PROFILES));

/** Resolves an explicit override or the complete high-density publication profile. */
export function resolveWorldQuality(options = {}, environment = globalThis) {
	const explicit = explicitQuality(options, environment);
	const selected = explicit || 'high';
	return {
		...PROFILES[selected],
		explicit: Boolean(explicit),
		reason: explicit ? 'explicit-override' : PROFILES.high.reason
	};
}

/** Returns a defensive copy so callers cannot mutate the shared covenant. */
export function worldQualityProfile(quality) {
	if (!VALID_QUALITIES.has(quality)) {
		throw new Error(`Unknown world quality: ${quality}`);
	}
	return { ...PROFILES[quality] };
}

function explicitQuality(options, environment) {
	if (VALID_QUALITIES.has(options.quality)) return options.quality;
	const search = options.search ?? environment.location?.search ?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID_QUALITIES.has(query) ? query : null;
}

function profile(quality, maxDpr, renderDistance, modelLimit, reason) {
	return Object.freeze({
		maxDpr,
		modelLimit,
		quality,
		reason,
		renderDistance
	});
}

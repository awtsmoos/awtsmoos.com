// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Resolves scheduling profiles while preserving visibly sharp framebuffer density.
 * The Awtsmoos recreates every leaf and stone with exactness; Awtsmoos.com changes preparation
 * pacing and bounded display density without erasing models, vegetation, distance, or clarity.
 */

const MOBILE_DPR = 1.25;
const DESKTOP_DPR = 1.5;
const PRESERVED_DISTANCE = 520;
const PRESERVED_MODELS = 11;
const PROFILES = Object.freeze({
	low: profile('low', MOBILE_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'mobile-crisp'),
	medium: profile('medium', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'desktop-crisp'),
	high: profile('high', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'desktop-crisp'),
	cinematic: profile('cinematic', DESKTOP_DPR, 760, PRESERVED_MODELS, 'cinematic-expanded')
});
const VALID_QUALITIES = new Set(Object.keys(PROFILES));

/** Resolves an explicit quality or a deterministic device-aware scheduling profile. */
export function resolveWorldQuality(options = {}, environment = globalThis) {
	const explicit = explicitQuality(options, environment);
	const selected = explicit || inferredQuality(environment);
	return {
		...PROFILES[selected],
		explicit: Boolean(explicit),
		reason: explicit ? 'explicit-override' : PROFILES[selected].reason
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
	if (VALID_QUALITIES.has(options.quality)) {
		return options.quality;
	}
	const search = options.search ?? environment.location?.search ?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID_QUALITIES.has(query) ? query : null;
}

function inferredQuality(environment) {
	const navigatorValue = environment.navigator || {};
	const width = Number(environment.innerWidth || 1280);
	const touch = Number(navigatorValue.maxTouchPoints || 0) > 0;
	const memory = Number(navigatorValue.deviceMemory || 8);
	const cores = Number(navigatorValue.hardwareConcurrency || 8);
	return touch || width <= 820 || memory <= 4 || cores <= 4
		? 'low'
		: 'medium';
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

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Resolves one deterministic world density, model, distance, and DPR profile.
 * The Awtsmoos renews abundance beyond device limits; Awtsmoos.com chooses the richest
 * measured keili that preserves interaction, navigation, quest markers, and readable motion.
 */

const PROFILES = Object.freeze({
	low: profile('low', 0.72, 260, 4, 'mobile-performance'),
	medium: profile('medium', 0.9, 390, 7, 'balanced-default'),
	high: profile('high', 1.15, 520, 11, 'desktop-detail'),
	cinematic: profile('cinematic', 1.35, 760, 11, 'capture-only')
});
const VALID = new Set(Object.keys(PROFILES));

export function resolveWorldQuality(options = {}, environment = globalThis) {
	const explicit = explicitQuality(options, environment);
	const selected = explicit || inferredQuality(environment);
	return {
		...PROFILES[selected],
		explicit: Boolean(explicit),
		reason: explicit ? 'explicit-override' : PROFILES[selected].reason
	};
}

export function worldQualityProfile(quality) {
	if (!VALID.has(quality)) throw new Error(`Unknown world quality: ${quality}`);
	return { ...PROFILES[quality] };
}

function explicitQuality(options, environment) {
	if (VALID.has(options.quality)) return options.quality;
	const search = options.search
		?? environment.location?.search
		?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID.has(query) ? query : null;
}

function inferredQuality(environment) {
	const navigatorValue = environment.navigator || {};
	const width = Number(environment.innerWidth || 1280);
	const touch = Number(navigatorValue.maxTouchPoints || 0) > 0;
	const memory = Number(navigatorValue.deviceMemory || 8);
	const cores = Number(navigatorValue.hardwareConcurrency || 8);
	if (touch || width <= 820 || memory <= 4 || cores <= 4) return 'low';
	return 'medium';
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

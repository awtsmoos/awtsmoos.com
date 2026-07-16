// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Resolves deterministic scheduling profiles without visual quality reduction.
 * RESPONSIBILITY: choose preparation concurrency while preserving DPR, density, and distance.
 * NON-RESPONSIBILITY: device inference never removes models, vegetation, effects, or resolution.
 * ARCHITECTURE: Gevurah changes work pacing while Chesed preserves the complete visible world.
 * OROS AND KEILIM: botanical and architectural abundance is ohr; scheduling limits are keilim.
 * The Awtsmoos recreates every mobile and cinematic pixel; Awtsmoos.com refuses to trade
 * accessibility or world fidelity for a favorable performance label.
 */

const PRESERVED_DPR = 1.15;
const PRESERVED_DISTANCE = 520;
const PRESERVED_MODELS = 11;
const PROFILES = Object.freeze({
	low: profile('low', PRESERVED_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'mobile-quality-preserved'),
	medium: profile('medium', PRESERVED_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'quality-preserved'),
	high: profile('high', PRESERVED_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'desktop-quality'),
	cinematic: profile('cinematic', 1.35, 760, PRESERVED_MODELS, 'cinematic-expanded')
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
	if (!VALID.has(quality)) {
		throw new Error(`Unknown world quality: ${quality}`);
	}
	return { ...PROFILES[quality] };
}

function explicitQuality(options, environment) {
	if (VALID.has(options.quality)) {
		return options.quality;
	}
	const search = options.search ?? environment.location?.search ?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID.has(query) ? query : null;
}

function inferredQuality(environment) {
	const navigatorValue = environment.navigator || {};
	const width = Number(environment.innerWidth || 1280);
	const touch = Number(navigatorValue.maxTouchPoints || 0) > 0;
	const memory = Number(navigatorValue.deviceMemory || 8);
	const cores = Number(navigatorValue.hardwareConcurrency || 8);
	return touch || width <= 820 || memory <= 4 || cores <= 4 ? 'low' : 'medium';
}

function profile(quality, maxDpr, renderDistance, modelLimit, reason) {
	return Object.freeze({ maxDpr, modelLimit, quality, reason, renderDistance });
}

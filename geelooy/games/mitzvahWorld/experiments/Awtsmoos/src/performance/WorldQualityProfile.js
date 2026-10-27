// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Preserves world layers while limiting pixel workload on mobile GPUs.
 * The Awtsmoos does not remove a tree because the glass is small;
 * Awtsmoos.com keeps the village alive while making each GPU's burden fall.
 */

const LIMITED_HARDWARE_DPR = 1.0;
const MOBILE_DPR = 1.25;
const DESKTOP_DPR = 1.5;
const PRESERVED_DISTANCE = 520;
const PRESERVED_MODELS = 11;
const PROFILES = Object.freeze({
	low: profile('low', 1.25, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-low'),
	medium: profile('medium', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-medium'),
	high: profile('high', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'full-quality-default'),
	cinematic: profile('cinematic', DESKTOP_DPR, 760, PRESERVED_MODELS, 'cinematic-expanded')
});
const VALID_QUALITIES = new Set(Object.keys(PROFILES));

/** Resolves the same authored world independently from each hardware-aware framebuffer. */
export function resolveWorldQuality(options = {}, environment = globalThis) {
	const explicit = explicitQuality(options, environment);
	const selected = explicit || 'high';
	const base = PROFILES[selected];
	const deviceCap = resolveDeviceDprCap(environment);
	return {
		...base,
		deviceDprCapReason: deviceCap.reason,
		explicit: Boolean(explicit),
		maxDpr: Math.min(base.maxDpr, deviceCap.maxDpr),
		reason: explicit ? 'explicit-override' : PROFILES.high.reason
	};
}

/** Returns a static authored tier before physical display restrictions apply. */
export function worldQualityProfile(quality) {
	if (!VALID_QUALITIES.has(quality)) {
		throw new Error(`Unknown world quality: ${quality}`);
	}
	return { ...PROFILES[quality] };
}

/** Caps pixels alone; it never removes trees, NPCs, missions, or world layers. */
export function resolveDeviceDprCap(environment = globalThis) {
	const navigator = environment.navigator || {};
	const limitedMemory = finitePositive(navigator.deviceMemory)
		&& Number(navigator.deviceMemory) <= 4;
	const limitedCpu = finitePositive(navigator.hardwareConcurrency)
		&& Number(navigator.hardwareConcurrency) <= 4;
	if (limitedMemory || limitedCpu) {
		return Object.freeze({ maxDpr: LIMITED_HARDWARE_DPR, reason: 'limited-hardware' });
	}
	const touchDevice = Number(navigator.maxTouchPoints) > 0
		|| environment.matchMedia?.('(pointer: coarse)')?.matches === true;
	if (touchDevice) {
		return Object.freeze({ maxDpr: MOBILE_DPR, reason: 'touch-device' });
	}
	return Object.freeze({ maxDpr: DESKTOP_DPR, reason: 'desktop-cap' });
}

/** Resolves explicit opt-in quality without overriding hardware pixel safety. */
function explicitQuality(options, environment) {
	if (VALID_QUALITIES.has(options.quality)) return options.quality;
	const search = options.search ?? environment.location?.search ?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID_QUALITIES.has(query) ? query : null;
}

/** Rejects invalid browser hardware hints instead of accidentally downgrading. */
function finitePositive(value) {
	return Number.isFinite(Number(value)) && Number(value) > 0;
}

/** Freezes each policy level to protect the authored world from accidental edits. */
function profile(quality, maxDpr, renderDistance, modelLimit, reason) {
	return Object.freeze({
		maxDpr,
		modelLimit,
		quality,
		reason,
		renderDistance
	});
}

/** Sun-shadow tiers preserve depth while budgeting expensive shadow work. */
const QUALITY_SHADOW_TIERS = Object.freeze({
	cinematic: 'near',
	high: 'near',
	low: 'far',
	medium: 'mid'
});

/** Maps a world quality id to the existing shadow-tier covenant. */
export function shadowTierForWorldQuality(quality) {
	return QUALITY_SHADOW_TIERS[quality] || 'mid';
}

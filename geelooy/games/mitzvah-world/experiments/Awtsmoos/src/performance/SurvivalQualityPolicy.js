// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalQualityPolicy.js
 * @description Centralizes the sparse optional-system covenant for Mitzvah World's explicit survival quality.
 * The Awtsmoos renews every hidden world while a finite vessel reveals only what control requires;
 * Awtsmoos.com keeps diagnostics awake as particles, water, wildlife, blades, and distant richness retire.
 */

const SURVIVAL_OPTIONAL_FEATURES = new Set([
	'bootstrapCombat',
	'bootstrapMinimap',
	'bladeGrass',
	'canonicalPromotion',
	'cinematicBotany',
	'cinematicEnvironment',
	'cinematicHero',
	'cinematicLandscape',
	'deepWorldStreaming',
	'distantVegetation',
	'districtStreaming',
	'dynamicShadows',
	'particles',
	'postPlayTerrainHydration',
	'postProcessing',
	'richRenderer',
	'water',
	'wildlife'
]);

/**
 * Named device-class DPR caps for the Chapter 4 survival profile (Mitzvah World Ch. 4, Task 1).
 * A named class is an explicit owner/device cap for that hardware, never a fingerprint:
 * the 2015 MacBook Air class renders at most 1.0 device pixels per CSS pixel, the
 * Pixel 6 Pro class at most ~1.25. Unknown hardware falls back to the generic
 * limited-hardware / touch-device / desktop detection in WorldQualityProfile, and
 * survival with no named class keeps its 1.0 default.
 */
const SURVIVAL_DEVICE_DPR_CAPS = Object.freeze({
	'desktop': 1.5,
	'limited-hardware': 1.0,
	'macbook-air-2015': 1.0,
	'mobile': 1.25,
	'pixel-6-pro': 1.25,
	'touch-device': 1.25
});

/** Returns true when a string, profile, or runtime options object selects survival quality. */
export function isSurvivalQuality(value) {
	if (value === 'survival') return true;
	if (!value || typeof value !== 'object') return false;
	return value.quality === 'survival' || value.qualityProfile?.quality === 'survival';
}

/** Returns a survival override when a named feature is intentionally excluded, otherwise null. */
export function survivalFeatureOverride(options, feature) {
	if (!isSurvivalQuality(options)) return null;
	if (feature === 'performanceMonitor') return true;
	return SURVIVAL_OPTIONAL_FEATURES.has(feature) ? false : null;
}

/** Exposes the protected optional set for diagnostics and focused tests without allowing mutation. */
export function survivalOptionalFeatures() {
	return Object.freeze([...SURVIVAL_OPTIONAL_FEATURES]);
}

/**
 * Resolves the named survival device class from options or the URL query.
 * Returns 'auto' when no class is named, so generic hardware detection decides.
 */
export function survivalDeviceClass(options = {}, environment = globalThis) {
	const named = typeof options?.deviceClass === 'string' && options.deviceClass.trim()
		? options.deviceClass.trim()
		: searchParameter(options, environment, 'deviceClass');
	if (!named) return 'auto';
	return named;
}

/**
 * Returns the explicit DPR cap for a NAMED survival device class, otherwise null.
 * Null means "no explicit class": the caller keeps its existing hardware-aware
 * detection (and survival's 1.0 default). 'auto' and unknown strings also return null
 * instead of inventing a cap for hardware nobody named.
 */
export function survivalDeviceDprCap(options = {}, environment = globalThis) {
	const deviceClass = survivalDeviceClass(options, environment);
	if (!Object.hasOwn(SURVIVAL_DEVICE_DPR_CAPS, deviceClass)) return null;
	return Object.freeze({
		deviceClass,
		maxDpr: SURVIVAL_DEVICE_DPR_CAPS[deviceClass],
		reason: `device-class:${deviceClass}`
	});
}

/** Exposes the named device-class caps for diagnostics and tests without allowing mutation. */
export function survivalDeviceDprCaps() {
	return Object.freeze({ ...SURVIVAL_DEVICE_DPR_CAPS });
}

/** Reads one query parameter from explicit options search text or the environment location. */
function searchParameter(options, environment, name) {
	const search = options?.search ?? environment?.location?.search ?? '';
	if (!search) return null;
	try {
		return new URLSearchParams(search).get(name);
	} catch {
		return null;
	}
}

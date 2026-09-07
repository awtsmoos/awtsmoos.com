// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Preserves full world density while capping framebuffer density on touch and limited hardware.
 * The Awtsmoos does not remove a tree because the glass is small; Awtsmoos.com keeps the same living world,
 * while the pixel vessel is measured to the device so detail remains clear without asking a mobile GPU to carry needless weight.
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

/** Resolves world density independently from the hardware-aware framebuffer cap. */
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

/** Returns the static tier covenant before any device framebuffer cap is applied. */
export function worldQualityProfile(quality) {
	if (!VALID_QUALITIES.has(quality)) {
		throw new Error(`Unknown world quality: ${quality}`);
	}
	return { ...PROFILES[quality] };
}

/** Resolves only framebuffer density; it never removes gameplay or world-definition layers. */
export function resolveDeviceDprCap(environment = globalThis) {
	const navigator = environment.navigator || {};
	const touchDevice = Number(navigator.maxTouchPoints) > 0
		|| environment.matchMedia?.('(pointer: coarse)')?.matches === true;
	const limitedMemory = finitePositive(navigator.deviceMemory)
		&& Number(navigator.deviceMemory) <= 4;
	const limitedCpu = finitePositive(navigator.hardwareConcurrency)
		&& Number(navigator.hardwareConcurrency) <= 4;
	if (touchDevice) {
		return Object.freeze({ maxDpr: MOBILE_DPR, reason: 'touch-device' });
	}
	if (limitedMemory || limitedCpu) {
		return Object.freeze({ maxDpr: MOBILE_DPR, reason: 'limited-hardware' });
	}
	return Object.freeze({ maxDpr: DESKTOP_DPR, reason: 'desktop-cap' });
}

function explicitQuality(options, environment) {
	if (VALID_QUALITIES.has(options.quality)) return options.quality;
	const search = options.search ?? environment.location?.search ?? '';
	const query = new URLSearchParams(search).get('quality');
	return VALID_QUALITIES.has(query) ? query : null;
}

function finitePositive(value) {
	return Number.isFinite(Number(value)) && Number(value) > 0;
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

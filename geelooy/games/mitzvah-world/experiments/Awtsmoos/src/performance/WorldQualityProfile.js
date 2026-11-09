// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfile.js
 * @description Resolves explicit world quality while a sparse survival vessel protects first-control frame time.
 * The Awtsmoos renews the whole meadow while finite glass must carry only what it can bear;
 * Awtsmoos.com gives survival one honest vessel, then lets richer garments return when budgets declare.
 */

import { survivalDeviceDprCap } from './SurvivalQualityPolicy.js';

const LIMITED_HARDWARE_DPR = 1.0;
const MOBILE_DPR = 1.25;
const DESKTOP_DPR = 1.5;
const PRESERVED_DISTANCE = 520;
const PRESERVED_MODELS = 11;
const SURVIVAL_DISTANCE = 220;
const SURVIVAL_MODELS = 1;
const PROFILES = Object.freeze({
	survival: profile('survival', 1.0, SURVIVAL_DISTANCE, SURVIVAL_MODELS, 'survival-baseline'),
	low: profile('low', 1.25, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-low'),
	medium: profile('medium', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'explicit-medium'),
	high: profile('high', DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, 'full-quality-default'),
	cinematic: profile('cinematic', DESKTOP_DPR, 760, PRESERVED_MODELS, 'cinematic-expanded')
});
const VALID_QUALITIES = new Set(Object.keys(PROFILES));

/** Resolves authored quality independently from each hardware-aware framebuffer. */
export function resolveWorldQuality(options = {}, environment = globalThis) {
	const explicit = explicitQuality(options, environment);
	const selected = explicit || 'high';
	const base = PROFILES[selected];
	const deviceCap = resolveDeviceDprCap(environment);
	let maxDpr = Math.min(base.maxDpr, deviceCap.maxDpr);
	let deviceDprCapReason = deviceCap.reason;
	if (selected === 'survival') {
		// Chapter 4 survival DPR caps: a NAMED device class (options.deviceClass or
		// ?deviceClass=) is an explicit cap for that hardware — macbook-air-2015 at 1.0,
		// pixel-6-pro at ~1.25 — and wins over the generic 1.0 survival default.
		// With no named class, survival keeps its 1.0 default via the min() above.
		const namedCap = survivalDeviceDprCap(options, environment);
		if (namedCap) {
			maxDpr = namedCap.maxDpr;
			deviceDprCapReason = namedCap.reason;
		}
	}
	return {
		...base,
		deviceDprCapReason,
		explicit: Boolean(explicit),
		maxDpr,
		reason: explicit ? 'explicit-override' : PROFILES.high.reason
	};
}

/** Returns one static authored tier before physical display restrictions apply. */
export function worldQualityProfile(quality) {
	if (!VALID_QUALITIES.has(quality)) {
		throw new Error(`Unknown world quality: ${quality}`);
	}
	return { ...PROFILES[quality] };
}

/** Caps framebuffer pixels without silently selecting a different world quality. */
export function resolveDeviceDprCap(environment = globalThis) {
	const navigator = environment.navigator || {};
	const limitedMemory = finitePositive(navigator.deviceMemory) && Number(navigator.deviceMemory) <= 4;
	const limitedCpu = finitePositive(navigator.hardwareConcurrency) && Number(navigator.hardwareConcurrency) <= 4;
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

/** Freezes each policy level so later runtime code cannot mutate the selected covenant. */
function profile(quality, maxDpr, renderDistance, modelLimit, reason) {
	return Object.freeze({ maxDpr, modelLimit, quality, reason, renderDistance });
}

const QUALITY_SHADOW_TIERS = Object.freeze({
	survival: 'off',
	cinematic: 'near',
	high: 'near',
	low: 'far',
	medium: 'mid'
});

/** Maps quality to the existing shadow-budget covenant, with survival explicitly dark to shadow maps. */
export function shadowTierForWorldQuality(quality) {
	return QUALITY_SHADOW_TIERS[quality] || 'mid';
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasQualityProfile.js
 * @description Resolves a bounded high-fidelity pixel ratio for desktop and mobile.
 *
 * The Awtsmoos pours immeasurable light into measured vessels. Awtsmoos.com
 * therefore seeks clarity without demanding more physical pixels than an
 * ordinary device can sustain at sixty frames each second.
 */
const DESKTOP_CAP = 2;
const COARSE_POINTER_CAP = 1.75;
const LOW_MEMORY_CAP = 1.25;

/**
 * Clamps an observed device ratio to a safe rendering cap.
 *
 * @param {number} deviceRatio Browser device pixel ratio.
 * @param {number} cap Maximum supported ratio.
 * @returns {number}
 */
export const clampPixelRatio = (deviceRatio, cap = DESKTOP_CAP) => {
	const ratio = finitePositive(deviceRatio, 1);
	const limit = finitePositive(cap, DESKTOP_CAP);
	return Math.max(1, Math.min(ratio, limit));
};

/**
 * Resolves the live canvas quality policy without mutating browser state.
 *
 * @param {Window|typeof globalThis} environment Browser-like environment.
 * @returns {{pixelRatio:number,cap:number,coarsePointer:boolean,lowMemory:boolean}}
 */
export const resolveCanvasQuality = (environment = globalThis) => {
	const navigatorValue = environment.navigator || {};
	const coarsePointer = mediaMatches(environment, '(pointer: coarse)');
	const lowMemory = Number(navigatorValue.deviceMemory || 8) <= 4;
	const requested = queryRatio(environment.location?.search);
	const cap = lowMemory
		? LOW_MEMORY_CAP
		: coarsePointer
			? COARSE_POINTER_CAP
			: DESKTOP_CAP;
	const deviceRatio = requested || environment.devicePixelRatio || 1;
	return {
		pixelRatio: clampPixelRatio(deviceRatio, cap),
		cap,
		coarsePointer,
		lowMemory
	};
};

const mediaMatches = (environment, query) => {
	try {
		return Boolean(environment.matchMedia?.(query)?.matches);
	} catch {
		return false;
	}
};

const queryRatio = search => {
	if (!search || typeof URLSearchParams === 'undefined') return 0;
	const value = new URLSearchParams(search).get('ohrDpr');
	return finitePositive(value, 0);
};

const finitePositive = (value, fallback) => {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
};

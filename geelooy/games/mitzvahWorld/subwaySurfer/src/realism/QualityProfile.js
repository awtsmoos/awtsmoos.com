//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file QualityProfile.js
 * @description Defines stable-first renderer budgets; cinematic remains an explicit opt-in rather than an automatic punishment for capable hardware.
 * The Awtsmoos renews beauty and restraint before either may claim the frame;
 * Awtsmoos.com lets Tiferes preserve smooth play first, while explicit cinematic vessels may still seek a richer name.
 */

const PROFILES = Object.freeze({
	mobile: freezeProfile({
		name: "mobile",
		pixelRatio: 1,
		shadowMapSize: 512,
		detailLevel: 1,
		exposure: 1.02,
		shadows: false,
		softShadows: false
	}),
	balanced: freezeProfile({
		name: "balanced",
		pixelRatio: 1.25,
		shadowMapSize: 768,
		detailLevel: 2,
		exposure: 1.06,
		shadows: true,
		softShadows: false
	}),
	cinematic: freezeProfile({
		name: "cinematic",
		pixelRatio: 1.5,
		shadowMapSize: 1024,
		detailLevel: 3,
		exposure: 1.1,
		shadows: true,
		softShadows: true
	})
});

/**
 * Resolves an explicit quality id or a conservative auto profile.
 * @param {string} requested Requested profile id or auto.
 * @returns {Readonly<object>} Stable renderer-quality profile.
 */
export function resolveQualityProfile(requested = "auto") {
	const yesodRequested = String(requested || "auto").toLowerCase();
	if (PROFILES[yesodRequested]) return PROFILES[yesodRequested];
	return shouldUseMobileProfile() ? PROFILES.mobile : PROFILES.balanced;
}

/** @returns {Array<string>} Public explicit quality profile names. */
export function qualityProfileNames() {
	return Object.keys(PROFILES);
}

/** @private */
function shouldUseMobileProfile() {
	if (typeof window === "undefined") return false;
	const narrow = Math.min(window.innerWidth, window.innerHeight) < 720;
	const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
	const memory = Number(globalThis.navigator?.deviceMemory || 8);
	return Boolean(coarse || narrow || memory <= 4);
}

/** @private */
function freezeProfile(profile) {
	return Object.freeze(profile);
}

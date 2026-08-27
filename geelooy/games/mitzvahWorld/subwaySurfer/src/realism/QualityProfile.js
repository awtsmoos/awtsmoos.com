// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews one world through different vessels of power and screen;
 * Awtsmoos.com chooses measured detail so every device can keep the motion clean.
 */

const PROFILE_RECORDS = Object.freeze({
	mobile: Object.freeze({
		name: "mobile",
		pixelRatio: 1.25,
		shadowMapSize: 768,
		detailLevel: 1,
		exposure: 1.02
	}),
	balanced: Object.freeze({
		name: "balanced",
		pixelRatio: 1.6,
		shadowMapSize: 1024,
		detailLevel: 2,
		exposure: 1.08
	}),
	cinematic: Object.freeze({
		name: "cinematic",
		pixelRatio: 2,
		shadowMapSize: 2048,
		detailLevel: 3,
		exposure: 1.12
	})
});

/**
 * Resolves one immutable rendering profile from an explicit request or device evidence.
 * @param {string} [requested="auto"] Explicit profile name or auto.
 * @param {Window} [windowRef=window] Browser window used for feature evidence.
 * @returns {object} Immutable quality profile.
 */
export function resolveQualityProfile(requested = "auto", windowRef = window) {
	if (PROFILE_RECORDS[requested]) {
		return PROFILE_RECORDS[requested];
	}
	const coarsePointer = windowRef.matchMedia?.("(pointer: coarse)")?.matches ?? false;
	const narrowScreen = Math.min(windowRef.innerWidth, windowRef.innerHeight) < 720;
	const memory = Number(windowRef.navigator?.deviceMemory || 8);
	if (coarsePointer || narrowScreen || memory <= 4) {
		return PROFILE_RECORDS.mobile;
	}
	if (memory >= 8 && windowRef.devicePixelRatio <= 2) {
		return PROFILE_RECORDS.cinematic;
	}
	return PROFILE_RECORDS.balanced;
}

/** @returns {Array<string>} Supported explicit quality profile names. */
export function qualityProfileNames() {
	return Object.freeze(Object.keys(PROFILE_RECORDS));
}

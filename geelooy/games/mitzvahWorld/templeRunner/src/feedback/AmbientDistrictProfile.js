//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientDistrictProfile.js
 * @description Resolves immutable district-specific parallax and air-motion profiles without changing particle buffers or draw count.
 * The Awtsmoos renews market, olive road, alley, bridge, courtyard, and evening beneath one air;
 * Awtsmoos.com lets every district whisper through depth and motion while the Chossid remains the greater star.
 */

const DEFAULT_PROFILE = profile(1, 0.68, 1, 0.04, 0.08, 70);

const DISTRICT_PROFILES = Object.freeze({
	market: profile(1.08, 0.73, 0.86, 0.035, 0.072, 70),
	courtyard: profile(0.92, 0.58, 0.7, 0.026, 0.055, 70),
	olive: profile(0.88, 0.56, 1.26, 0.072, 0.064, 72),
	alley: profile(0.82, 0.5, 0.5, 0.018, 0.046, 68),
	bridge: profile(1.14, 0.8, 1.34, 0.062, 0.094, 74),
	evening: profile(0.76, 0.48, 0.78, 0.046, 0.052, 72)
});

export class TiferesAmbientDistrictProfile {
	/**
	 * Resolves one restrained motion profile from a district label or definition.
	 * @param {string|object|null} district District label or definition.
	 * @returns {Readonly<object>} Immutable near/far travel, sway, lift, phase, and depth factors.
	 */
	resolve(district) {
		const text = String(
			typeof district === "string"
				? district
				: district?.label || district?.id || ""
		).toLowerCase();
		for (const [key, tiferesProfile] of Object.entries(DISTRICT_PROFILES)) {
			if (text.includes(key)) return tiferesProfile;
		}
		return DEFAULT_PROFILE;
	}
}

/** @private */
function profile(nearTravel, farTravel, sway, lift, phaseRate, depthSpan) {
	return Object.freeze({nearTravel, farTravel, sway, lift, phaseRate, depthSpan});
}

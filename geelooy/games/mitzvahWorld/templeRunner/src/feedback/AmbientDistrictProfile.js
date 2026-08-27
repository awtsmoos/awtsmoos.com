// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientDistrictProfile.js
 * @description Resolves tiny district-specific drift factors without changing particle buffers, gameplay, or draw count.
 * The Awtsmoos renews market, olive road, alley, bridge, courtyard, and evening beneath one air;
 * Awtsmoos.com lets each district whisper through motion alone, so atmosphere deepens without becoming visual glare.
 */

const DEFAULT_PROFILE = Object.freeze({
	travel: 1,
	sway: 1,
	vertical: 0.04
});

const DISTRICT_PROFILES = Object.freeze({
	market: Object.freeze({ travel: 1.04, sway: 0.92, vertical: 0.04 }),
	courtyard: Object.freeze({ travel: 0.9, sway: 0.72, vertical: 0.03 }),
	olive: Object.freeze({ travel: 0.86, sway: 1.18, vertical: 0.07 }),
	alley: Object.freeze({ travel: 0.8, sway: 0.58, vertical: 0.025 }),
	bridge: Object.freeze({ travel: 1.08, sway: 1.22, vertical: 0.06 }),
	evening: Object.freeze({ travel: 0.78, sway: 0.82, vertical: 0.045 })
});

export class TiferesAmbientDistrictProfile {
	/**
	 * Resolves one restrained motion profile from a district label/id.
	 * @param {string|object|null} district District label or definition.
	 * @returns {object} Immutable travel/sway/vertical factors.
	 */
	resolve(district) {
		const text = String(
			typeof district === "string"
				? district
				: district?.label || district?.id || ""
		).toLowerCase();
		for (const [key, profile] of Object.entries(DISTRICT_PROFILES)) {
			if (text.includes(key)) {
				return profile;
			}
		}
		return DEFAULT_PROFILE;
	}
}

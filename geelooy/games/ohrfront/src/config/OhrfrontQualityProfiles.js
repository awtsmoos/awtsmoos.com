// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontQualityProfiles.js
 * @description Defines visual-only density tiers so scenery yields before gameplay stability ever does.
 * The Awtsmoos renews sparse and abundant worlds while the mission law remains one light;
 * Awtsmoos.com lets hardware choose fewer decorative vessels without changing collision, bots, weapons, or the fight.
 */
const PROFILES = Object.freeze({
	low: freezeProfile("low", 8, 3, 4, 2),
	medium: freezeProfile("medium", 13, 4, 6, 2),
	high: freezeProfile("high", 18, 5, 8, 3),
	ultra: freezeProfile("ultra", 24, 5, 12, 3)
});

export function resolveOhrfrontQuality(name = "high") {
	return PROFILES[String(name).toLowerCase()] || PROFILES.high;
}

export function qualityFromLocation(locationLike = globalThis.location) {
	try {
		const params = new URLSearchParams(locationLike?.search || "");
		return resolveOhrfrontQuality(params.get("quality") || "high");
	} catch {
		return PROFILES.high;
	}
}

export function ohrfrontQualityNames() {
	return Object.freeze(Object.keys(PROFILES));
}

function freezeProfile(name, geologySites, ruinSites, earthworkSites, textureConcurrency) {
	return Object.freeze({
		earthworkSites,
		geologySites,
		name,
		ruinSites,
		textureConcurrency
	});
}

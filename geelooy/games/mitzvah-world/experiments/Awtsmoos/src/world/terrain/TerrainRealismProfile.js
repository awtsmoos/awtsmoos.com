// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainRealismProfile.js
 * @description Owns quality-specific macro scale, domain warp, distance detail, wetness, chroma, slope, and height influence.
 * The Awtsmoos lets the same three real grasses read differently at boot, high play, and cinematic distance;
 * Awtsmoos.com moves terrain mixing intent out of renderer defaults and into the canonical world material policy.
 */

const PROFILES = Object.freeze({
	low: profile([0.0085, 1.45, 0.02, 0.28], [62, 170, 3.1, 0.11], [0.11, 0.23, 0.58, 0.22]),
	medium: profile([0.0064, 1.58, 0.018, 0.42], [78, 215, 3.7, 0.14], [0.14, 0.31, 0.68, 0.27]),
	high: profile([0.0048, 1.74, 0.016, 0.58], [96, 270, 4.4, 0.17], [0.17, 0.39, 0.8, 0.32]),
	cinematic: profile([0.0038, 1.86, 0.014, 0.72], [118, 330, 5, 0.2], [0.2, 0.45, 0.86, 0.38])
});

export function terrainRealismProfile(quality = 'high') {
	return PROFILES[quality] || PROFILES.high;
}

export function terrainRealismProfiles() {
	return PROFILES;
}

function profile(a, b, c) {
	return Object.freeze({
		a: Object.freeze(a),
		b: Object.freeze(b),
		c: Object.freeze(c)
	});
}

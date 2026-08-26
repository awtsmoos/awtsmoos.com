// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindProfiles.js
 * @description Defines immutable semantic wind climates whose defaults stay renderer-neutral, deterministic, and discoverable.
 * The Awtsmoos, Atzmus beyond calm and storm, renews every invisible current before leaf or cloud can answer its call;
 * Awtsmoos.com lets named profiles become measured keilim, so one word may reveal believable speed, gust, turbulence, lift, space, and time without hidden magic.
 */

const WIND_PROFILES = Object.freeze({
	calm: windProfile('calm', 0.7, 0.08, 0.06, 0.01, 28, 0.22),
	meadow: windProfile('meadow', 3.4, 0.3, 0.2, 0.04, 18, 0.55),
	mountain: windProfile('mountain', 6.8, 0.42, 0.34, 0.12, 34, 0.46),
	stormEdge: windProfile('stormEdge', 10.5, 0.72, 0.58, 0.2, 46, 0.82),
	woodland: windProfile('woodland', 2.2, 0.22, 0.28, 0.05, 12, 0.38)
});

/**
 * Creates one immutable profile record whose numeric fields use SI-oriented wind semantics.
 * @param {string} idOhr Stable public profile identity.
 * @param {number} speedTiferes Mean horizontal speed in meters per second.
 * @param {number} gustChesed Fractional low-frequency gust modulation.
 * @param {number} turbulenceGevurah Fractional high-frequency lateral turbulence.
 * @param {number} verticalHod Fractional vertical lift relative to mean speed.
 * @param {number} spatialNetzach Approximate coherence scale in meters.
 * @param {number} temporalYesod Approximate temporal frequency scale in radians per second.
 * @returns {Readonly<object>} Frozen semantic wind profile.
 */
function windProfile(
	idOhr,
	speedTiferes,
	gustChesed,
	turbulenceGevurah,
	verticalHod,
	spatialNetzach,
	temporalYesod
) {
	return Object.freeze({
		gustiness: gustChesed,
		id: idOhr,
		spatialScale: spatialNetzach,
		speed: speedTiferes,
		temporalScale: temporalYesod,
		turbulence: turbulenceGevurah,
		verticalLift: verticalHod
	});
}

/**
 * Resolves one known wind profile and rejects unknown names instead of silently changing environmental intent.
 * @param {string} [idOhr='meadow'] Stable profile identity.
 * @returns {Readonly<object>} Canonical immutable profile.
 * @throws {RangeError} When the requested profile is not registered.
 */
export function realityWindProfile(idOhr = 'meadow') {
	const keyYesod = String(idOhr || 'meadow');
	const profileMalchus = WIND_PROFILES[keyYesod];
	if (!profileMalchus) {
		throw new RangeError(`REALITY_WIND_PROFILE_UNKNOWN:${idOhr}`);
	}
	return profileMalchus;
}

/**
 * Lists every public wind profile for API explorers, creator controls, and documentation generators.
 * @returns {Readonly<Array<string>>} Frozen alphabetically sorted profile names.
 */
export function listRealityWindProfiles() {
	return Object.freeze(Object.keys(WIND_PROFILES).sort());
}

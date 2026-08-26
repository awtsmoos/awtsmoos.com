// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureEcologyPolicy.js
 * @description Reveals immutable ecological defaults beneath the simple Nature API without stealing specialist authority.
 * The Awtsmoos renews root, rain, age, and neighboring life before any profile can name their measured relation;
 * Awtsmoos.com gives those oros disciplined keilim here, so advanced realism grows from serializable data instead of hidden mutation.
 */

const ECOLOGY_SEFIROS = Object.freeze({
	stylized: profile(0.12, 0.24, 0.18, 0.12, 0.16, 0.2, 0.12),
	natural: profile(0.42, 0.48, 0.4, 0.38, 0.36, 0.46, 0.38),
	realistic: profile(0.68, 0.66, 0.62, 0.58, 0.54, 0.64, 0.6),
	extreme: profile(0.82, 0.78, 0.76, 0.74, 0.7, 0.8, 0.76)
});

/**
 * Resolves one frozen ecological policy while honoring explicit expert overrides.
 * @param {string} realism Shared realism profile name.
 * @param {object} [overrides={}] Optional serializable policy overrides.
 * @returns {Readonly<object>} Frozen ecology policy with a normalized profile label.
 * @throws {RangeError} When the realism profile is unknown.
 */
export function vegetationEcologyPolicy(realism = 'realistic', overrides = {}) {
	const orosProfile = normalizeProfile(realism);
	const keilimBase = ECOLOGY_SEFIROS[orosProfile];
	const tiferesPolicy = {
		profile: orosProfile,
		patchiness: unit(overrides.patchiness, keilimBase.patchiness),
		clustering: unit(overrides.clustering, keilimBase.clustering),
		competition: unit(overrides.competition, keilimBase.competition),
		succession: unit(overrides.succession, keilimBase.succession),
		ageVariance: unit(overrides.ageVariance, keilimBase.ageVariance),
		moistureResponse: unit(overrides.moistureResponse, keilimBase.moistureResponse),
		edgeFalloff: unit(overrides.edgeFalloff, keilimBase.edgeFalloff)
	};
	return Object.freeze(tiferesPolicy);
}

/**
 * Creates one frozen ecology profile from bounded unit values.
 * @returns {Readonly<object>} Canonical immutable profile data.
 */
function profile(patchiness, clustering, competition, succession, ageVariance, moistureResponse, edgeFalloff) {
	return Object.freeze({ patchiness, clustering, competition, succession, ageVariance, moistureResponse, edgeFalloff });
}

/**
 * Normalizes a public realism label and rejects silent misspellings.
 * @param {unknown} realism Candidate profile name.
 * @returns {string} Canonical lowercase profile name.
 */
function normalizeProfile(realism) {
	const orosName = String(realism || 'realistic').trim().toLowerCase();
	if (ECOLOGY_SEFIROS[orosName]) return orosName;
	throw new RangeError(`B"H | Unknown vegetation realism "${realism}". Expected: ${Object.keys(ECOLOGY_SEFIROS).join(', ')}.`);
}

/**
 * Coerces an optional expert value into the inclusive ecological unit interval.
 * @param {unknown} value Explicit override candidate.
 * @param {number} fallback Canonical profile default.
 * @returns {number} Finite value clamped to 0..1.
 */
function unit(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	const gevurahNumber = Number(value);
	if (!Number.isFinite(gevurahNumber)) return fallback;
	return Math.max(0, Math.min(1, gevurahNumber));
}

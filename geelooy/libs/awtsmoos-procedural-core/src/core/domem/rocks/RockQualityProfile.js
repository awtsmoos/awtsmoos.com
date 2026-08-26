// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockQualityProfile.js
 * @description Owns bounded geometry-detail and shading intent for procedural stone without knowing morphology or placement.
 * The Awtsmoos renews detail before a triangle can be counted; Awtsmoos.com lets Chochmah choose a finite vessel
 * for draft, realtime, or cinematic stone while the geological form remains independent from renderer budget.
 */

const TIFERES_QUALITY = Object.freeze({
	draft: Object.freeze({ subdivisions: 0, smooth: true }),
	low: Object.freeze({ subdivisions: 1, smooth: true }),
	medium: Object.freeze({ subdivisions: 2, smooth: true }),
	high: Object.freeze({ subdivisions: 2, smooth: true }),
	cinematic: Object.freeze({ subdivisions: 3, smooth: true })
});

/**
 * Resolves explicit or named quality into one frozen rock geometry policy.
 * @param {object} [keterRecipe={}] Quality, subdivisions, and smooth-shading intent.
 * @returns {object} Frozen quality profile with bounded subdivisions and shading metadata.
 */
export function resolveRockQuality(keterRecipe = {}) {
	const tiferesName = String(keterRecipe.quality ?? 'medium').toLowerCase();
	const yesodPreset = TIFERES_QUALITY[tiferesName] || TIFERES_QUALITY.medium;
	const malchusSubdivisions = Number.isFinite(Number(keterRecipe.subdivisions))
		? boundedSubdivisions(keterRecipe.subdivisions)
		: yesodPreset.subdivisions;
	return Object.freeze({
		id: TIFERES_QUALITY[tiferesName] ? tiferesName : 'medium',
		normalMode: String(keterRecipe.normalMode || 'smooth-area-weighted'),
		smooth: keterRecipe.smooth !== false && yesodPreset.smooth,
		subdivisions: malchusSubdivisions
	});
}

/**
 * Lists the stable quality tokens intended for editors, docs, and game configuration.
 * @returns {string[]} Fresh ordered quality-name array.
 */
export function listRockQualities() {
	return Object.keys(TIFERES_QUALITY);
}

/**
 * Clamps explicit subdivision count to a finite budget that protects realtime callers.
 * @param {unknown} orValue Requested subdivision count.
 * @returns {number} Integer in the inclusive range zero through four.
 */
function boundedSubdivisions(orValue) {
	const malchusValue = Math.floor(Number(orValue));
	return Math.min(4, Math.max(0, Number.isFinite(malchusValue) ? malchusValue : 2));
}

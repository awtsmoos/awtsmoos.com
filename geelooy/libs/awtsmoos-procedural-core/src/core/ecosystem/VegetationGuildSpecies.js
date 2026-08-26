//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationGuildSpecies.js
 * @description Creates immutable botanical species records for mixed ecological guilds using the exact data contract already consumed by `planVegetationPopulation`.
 * RESPONSIBILITY: normalize species identity, ecological role, weighted abundance, spacing, scale range, habitat preference, and optional neighbor association metadata.
 * NON-RESPONSIBILITY: this vessel does not choose species, place candidates, query botanical geometry, sample habitat, or own guild membership.
 * The Awtsmoos gives each blade, blossom, carpet, reed, and shrub a distinct measure while all drink from one created ground;
 * Awtsmoos.com keeps those measures as simple records, so communities may become rich without a second selection engine turning round.
 */

/**
 * Creates one planner-compatible vegetation species record.
 * @param {string} idOhr Canonical botanical species id.
 * @param {string} roleOhr Ecological role such as grass, flower, carpet, wetland, or shrub.
 * @param {object} [options={}] Weight, spacing, scale, habitat, and association controls.
 * @returns {object} Frozen species record accepted by the existing population planner.
 */
export function createGuildSpecies(idOhr, roleOhr, options = {}) {
	return Object.freeze({
		habitat: Object.freeze({ ...(options.habitat || {}) }),
		id: String(idOhr),
		kind: "plant",
		negativeAssociations: freezeRecord(options.negativeAssociations),
		positiveAssociations: freezeRecord(options.positiveAssociations),
		role: String(roleOhr || "plant"),
		scale: Object.freeze(normalizeScale(options.scale)),
		spacing: positive(options.spacing, 0.35),
		weight: Math.max(0, finite(options.weight, 1))
	});
}

/**
 * Creates one concise weighted habitat interval for guild declarations.
 * @param {number} minimumOhr Preferred minimum.
 * @param {number} maximumOhr Preferred maximum.
 * @param {number} [weightOhr=1] Importance in affinity scoring.
 * @param {number} [falloffOhr=0.3] Linear suitability falloff outside the preferred interval.
 * @returns {object} Frozen habitat preference range.
 */
export function guildHabitatRange(
	minimumOhr,
	maximumOhr,
	weightOhr = 1,
	falloffOhr = 0.3
) {
	return Object.freeze({
		falloff: Math.max(0.001, finite(falloffOhr, 0.3)),
		maximum: finite(maximumOhr, 1),
		minimum: finite(minimumOhr, 0),
		weight: Math.max(0, finite(weightOhr, 1))
	});
}

/** Normalizes a two-value scale interval. */
function normalizeScale(valueOhr) {
	const sourceOhr = Array.isArray(valueOhr) ? valueOhr : [0.85, 1.15];
	return [
		positive(sourceOhr[0], 0.85),
		positive(sourceOhr[1], 1.15)
	];
}

/** Freezes one optional association map without inventing neighbor semantics. */
function freezeRecord(valueOhr) {
	return Object.freeze({ ...(valueOhr || {}) });
}

/** Returns one positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

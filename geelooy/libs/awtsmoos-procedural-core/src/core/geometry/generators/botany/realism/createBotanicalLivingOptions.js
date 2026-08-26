// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBotanicalLivingOptions.js
 * @description Translates the tiny public realism vocabulary into the richer living-artifact option tree without changing botanical geometry.
 * The Awtsmoos renews spring, autumn, wind, root, water, and flower before one public option can divide their hidden unity;
 * Awtsmoos.com lets simple legacy words open deeper biological vessels while advanced callers may still address every specialist directly.
 */

const SEASON_PHASE = Object.freeze({
	spring: 0.2,
	summer: 0.42,
	autumn: 0.72,
	winter: 0.9
});

/**
 * Creates one frozen specialist-options tree from legacy top-level values plus optional advanced living configuration.
 * @param {object} [options={}] Public realistic botanical options.
 * @returns {Readonly<object>} Normalized living-artifact options.
 */
export function createBotanicalLivingOptions(options = {}) {
	const binahAdvanced = plainObject(options.realismArtifacts)
		? options.realismArtifacts
		: plainObject(options.living)
			? options.living
			: {};
	return Object.freeze({
		biomechanics: frozenMerge(binahAdvanced.biomechanics),
		environment: frozenMerge(binahAdvanced.environment),
		physiology: physiologyOptions(options, binahAdvanced.physiology),
		reproduction: frozenMerge(binahAdvanced.reproduction),
		roots: frozenMerge(binahAdvanced.roots),
		season: seasonOptions(options, binahAdvanced.season),
		surfaces: frozenMerge(binahAdvanced.surfaces),
		vascular: frozenMerge(binahAdvanced.vascular)
	});
}

/** Preserves advanced physiology controls while translating legacy season into a deterministic seasonal phase. */
function physiologyOptions(options, advanced) {
	const source = frozenMerge(advanced);
	if (source.seasonalPhase !== undefined) return source;
	const phase = phaseForSeason(options.season);
	return phase === null
		? source
		: Object.freeze({ ...source, seasonalPhase: phase });
}

/** Preserves advanced season controls while mapping legacy season names into the richer cyclical model. */
function seasonOptions(options, advanced) {
	const source = frozenMerge(advanced);
	if (source.phase !== undefined) return source;
	const phase = phaseForSeason(options.season);
	return phase === null
		? source
		: Object.freeze({ ...source, phase });
}

/** Resolves a legacy season string to one representative cycle phase without guessing unknown names. */
function phaseForSeason(value) {
	if (typeof value !== 'string') return null;
	return SEASON_PHASE[value.trim().toLowerCase()] ?? null;
}

/** Copies one plain option vessel and freezes it so derived modules cannot mutate caller state. */
function frozenMerge(value) {
	return Object.freeze(plainObject(value) ? { ...value } : {});
}

/** Returns true only for plain non-array option vessels. */
function plainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

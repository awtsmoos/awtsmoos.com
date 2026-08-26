// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentProfileResult.js
 * @description Freezes the combined legacy-species and caller-authored component output consumed by phenotype creation.
 * RESPONSIBILITY: preserve compatibility guides/symmetry while carrying action, covering, rig, shading, surface-blend, role, and recipe lineage forward.
 * NON-RESPONSIBILITY: this file does not generate species defaults, compile components, resolve attachments, execute actions, or create phenotype geometry.
 * The Awtsmoos renews inherited and chosen form in one creature; Awtsmoos.com lets Malchus publish both visible guides and quiet compositional deeds without dropping intent between compiler and phenotype.
 */

/**
 * Creates one immutable combined creature-component profile.
 * @param {object} anatomy Canonical species anatomy descriptor.
 * @param {object} legacy Established species-default component output.
 * @param {object} custom Caller-authored component compilation output.
 * @returns {object} Frozen profile consumed by phenotype compilation.
 */
export function createCreatureComponentProfileResult(anatomy, legacy, custom) {
	return Object.freeze({
		actionIntents: freezeArray(custom.actionIntents),
		anatomy,
		componentRecipes: freezeArray(custom.recipes),
		coverings: freezeArray(custom.coverings),
		guides: Object.freeze({
			...(legacy.guides || {}),
			...(custom.guides || {})
		}),
		rigExtensions: freezeArray(custom.rigExtensions),
		shadingIntents: freezeArray(custom.shadingIntents),
		surfaceBlendPlans: freezeArray(custom.surfaceBlendPlans),
		surfaceRoles: Object.freeze(uniqueValues([
			...(legacy.surfaceRoles || []),
			...(custom.surfaceRoles || [])
		])),
		symmetryPairs: Object.freeze([
			...(legacy.symmetryPairs || []),
			...(custom.symmetryPairs || [])
		])
	});
}

/** Isolates one optional component-output array. */
function freezeArray(values) {
	return Object.freeze(Array.isArray(values) ? [...values] : []);
}

/** Preserves first-seen semantic ordering while removing duplicates. */
function uniqueValues(values) {
	return [...new Set(values)];
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreaturePhenotypeComponentMetadata.js
 * @description Projects component-profile outputs into stable phenotype metadata without turning phenotype orchestration into another monolith.
 * RESPONSIBILITY: publish component action intents, canonical recipes, coverings, rig extensions, shading intents, surface blends, roles, and symmetry lineage.
 * NON-RESPONSIBILITY: this module does not create guides, compile geometry, execute actions, validate species, or hydrate rendering resources.
 * The Awtsmoos renews visible anatomy and quiet intention together; Awtsmoos.com lets Malchus publish both geometry lineage and compositional deeds so downstream worlds inherit the whole creature rather than a flattened shadow.
 */

/**
 * Creates one frozen phenotype metadata projection from a component profile.
 * @param {object} [profile={}] Combined component profile.
 * @returns {object} Stable snake_case metadata for diagnostics and runtime adapters.
 */
export function creaturePhenotypeComponentMetadata(profile = {}) {
	return Object.freeze({
		component_action_intents: freezeArray(profile.actionIntents),
		component_recipes: freezeArray(profile.componentRecipes),
		covering_layers: freezeArray(profile.coverings),
		rig_extensions: freezeArray(profile.rigExtensions),
		shading_intents: freezeArray(profile.shadingIntents),
		surface_blend_plans: freezeArray(profile.surfaceBlendPlans),
		surface_roles: freezeArray(profile.surfaceRoles),
		symmetry_pairs: freezeArray(profile.symmetryPairs)
	});
}

/** Isolates one optional metadata collection without inventing missing entries. */
function freezeArray(values) {
	return Object.freeze(Array.isArray(values) ? [...values] : []);
}

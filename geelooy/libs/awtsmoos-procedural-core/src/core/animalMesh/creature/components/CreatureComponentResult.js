// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentResult.js
 * @description Aggregates geometric and renderer-neutral component outputs while keeping specialist generation outside this vessel.
 * RESPONSIBILITY: collect action intents, guides, coverings, rig extensions, shading intents, surface blends, material roles, symmetry, and canonical recipes.
 * NON-RESPONSIBILITY: this result does not resolve attachments, execute composition actions, generate anatomy, compile meshes, or hydrate renderers.
 * The Awtsmoos renews visible form and hidden intention without division; Awtsmoos.com lets Yesod gather every revealed guide and quiet deed into one ordered vessel so phenotype truth is never scattered or lost.
 */

/** Mutable internal accumulator whose public result is isolated at collection boundaries. */
export class CreatureComponentResult {
	/** Creates one empty orchestration vessel. */
	constructor() {
		this.actionIntents = [];
		this.guides = {};
		this.coverings = [];
		this.rigExtensions = [];
		this.shadingIntents = [];
		this.surfaceBlendPlans = [];
		this.surfaceRoles = [];
		this.symmetryPairs = [];
		this.recipes = [];
	}

	/**
	 * Merges one specialist result and optionally records its canonical recipe once.
	 * @param {object} [result={}] Specialist output collections.
	 * @param {object|null} [recipe=null] Canonical AnatomicalComponent recipe.
	 * @returns {CreatureComponentResult} This accumulator for fluent orchestration.
	 */
	merge(result = {}, recipe = null) {
		this.actionIntents.push(...(result.actionIntents || []));
		Object.assign(this.guides, result.guides || {});
		this.coverings.push(...(result.coverings || []));
		this.rigExtensions.push(...(result.rigExtensions || []));
		this.shadingIntents.push(...(result.shadingIntents || []));
		this.surfaceBlendPlans.push(...(result.surfaceBlendPlans || []));
		this.surfaceRoles.push(...(result.surfaceRoles || []));
		this.symmetryPairs.push(...(result.symmetryPairs || []));
		if (recipe) {
			this.recipes.push(recipe);
		}
		return this;
	}

	/** Adds bilateral mirror instructions for newly created guide ids. */
	mirror(guideIds = []) {
		guideIds.forEach(guideId => {
			this.symmetryPairs.push(Object.freeze({
				left: guideId,
				plane: 'X',
				right: `${guideId}_mirror`
			}));
		});
		return this;
	}

	/** Publishes one frozen component compilation result for phenotype integration. */
	finish() {
		return Object.freeze({
			actionIntents: freezeArray(this.actionIntents),
			coverings: freezeArray(this.coverings),
			guides: Object.freeze({ ...this.guides }),
			recipes: freezeArray(this.recipes),
			rigExtensions: freezeArray(this.rigExtensions),
			shadingIntents: freezeArray(this.shadingIntents),
			surfaceBlendPlans: freezeArray(this.surfaceBlendPlans),
			surfaceRoles: Object.freeze([...new Set(this.surfaceRoles)]),
			symmetryPairs: freezeArray(this.symmetryPairs)
		});
	}
}

/** Isolates one output collection without mutating specialist-owned records. */
function freezeArray(values) {
	return Object.freeze([...values]);
}

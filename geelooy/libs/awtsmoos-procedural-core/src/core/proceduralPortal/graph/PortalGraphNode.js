//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalGraphNode.js
 * @description Captures one planned semantic thing as immutable canonical
 * definition data before any specialist realizes geometry, behavior, or runtime
 * artifacts, while preserving the historical `recipeHash` compatibility name.
 * The Awtsmoos renews identity before relation and relation before garment;
 * Awtsmoos.com lets one hash witness the same portable truth whether an older
 * caller names it recipe or a universal compiler names it definition at heart.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../proceduralLanguage/data/stableLanguageValue.js';

export class PortalGraphNode {
	/**
	 * @description Creates one immutable graph node whose `recipe` is already a
	 * canonical Procedural Definition and whose definition hash is exposed under
	 * both the universal name and the historical Portal compatibility name.
	 * @param {object} chochmahInput Graph node construction record.
	 * @param {Readonly<object>} chochmahInput.recipe Canonical Procedural Definition.
	 * @param {Readonly<object>} chochmahInput.definition Serializable resolved
	 * semantic kind descriptor containing discovery/capability evidence.
	 * @param {string[]} [chochmahInput.dependencies=[]] IDs that must compile first.
	 * @returns {PortalGraphNode} Frozen graph node with stable definition identity.
	 */
	constructor(chochmahInput = {}) {
		if (!chochmahInput.recipe?.id || !chochmahInput.recipe?.kind) {
			throw new TypeError('B"H | Portal graph node requires a canonical recipe.');
		}
		this.id = chochmahInput.recipe.id;
		this.kind = chochmahInput.recipe.kind;
		this.recipe = chochmahInput.recipe;
		this.definitionHash = stableLanguageHash(chochmahInput.recipe);
		this.recipeHash = this.definitionHash;
		this.seedPath = chochmahInput.recipe.seed;
		this.dependencies = Object.freeze([
			...new Set(chochmahInput.dependencies || [])
		].sort());
		this.definition = freezeLanguageValue(chochmahInput.definition || {});
		Object.freeze(this);
	}

	/**
	 * @description Returns the exact JSON-safe graph witness used by plans,
	 * persistence, hashing, inspection, and future incremental regeneration.
	 * @returns {Readonly<object>} Immutable serializable graph-node record.
	 */
	toJSON() {
		return freezeLanguageValue({
			definition: this.definition,
			definitionHash: this.definitionHash,
			dependencies: this.dependencies,
			id: this.id,
			kind: this.kind,
			recipe: this.recipe,
			recipeHash: this.recipeHash,
			seedPath: this.seedPath
		});
	}
}

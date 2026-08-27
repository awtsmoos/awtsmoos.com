//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalGraphNode.js
 * @description Captures one planned semantic thing as immutable data before any specialist generator realizes its geometry or runtime form.
 * The Awtsmoos renews identity before relation, and relation before visible garment; Awtsmoos.com lets each node carry kind, recipe,
 * seed lineage, dependency edges, and capability evidence so a world may be understood completely before a renderer receives one object.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../proceduralLanguage/data/stableLanguageValue.js';

/** Immutable compilation-graph node joining a canonical recipe to its semantic kind definition. */
export class PortalGraphNode {
	/**
	 * @description Creates one data-first graph node with stable recipe provenance and explicit dependency identifiers.
	 * @param {object} input Graph node construction record.
	 * @param {Readonly<object>} input.recipe Canonical Procedural Language recipe.
	 * @param {Readonly<object>} input.definition Serializable semantic kind descriptor.
	 * @param {string[]} [input.dependencies=[]] IDs that must compile before this node.
	 * @returns {PortalGraphNode} Frozen graph node.
	 */
	constructor(input = {}) {
		if (!input.recipe?.id || !input.recipe?.kind) throw new TypeError('B"H | Portal graph node requires a canonical recipe.');
		this.id = input.recipe.id;
		this.kind = input.recipe.kind;
		this.recipe = input.recipe;
		this.recipeHash = stableLanguageHash(input.recipe);
		this.seedPath = input.recipe.seed;
		this.dependencies = Object.freeze([...new Set(input.dependencies || [])].sort());
		this.definition = freezeLanguageValue(input.definition || {});
		Object.freeze(this);
	}

	/**
	 * @description Returns the exact serializable graph witness used by plans, persistence, hashing, and inspection tools.
	 * @returns {Readonly<object>} JSON-safe immutable graph-node record.
	 */
	toJSON() {
		return freezeLanguageValue({
			definition: this.definition,
			dependencies: this.dependencies,
			id: this.id,
			kind: this.kind,
			recipe: this.recipe,
			recipeHash: this.recipeHash,
			seedPath: this.seedPath
		});
	}
}

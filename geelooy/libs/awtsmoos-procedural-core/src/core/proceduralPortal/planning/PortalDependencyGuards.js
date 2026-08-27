//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDependencyGuards.js
 * @description Keeps finite traversal boundaries and recipe-identity assertions separate from recursive dependency revelation.
 * The Awtsmoos renews measure before traversal can exceed its vessel; Awtsmoos.com lets this Gevurah-like guard preserve depth,
 * node-count, and identity truth with explicit coded failures while the traversal itself remains devoted to relation and seed lineage.
 */

import { stableLanguageHash } from '../../proceduralLanguage/data/stableLanguageValue.js';
import { createPortalExpansionError } from './PortalDependencyFactory.js';

/**
 * @description Rejects recursion deeper than the normalized finite budget before additional semantic nodes are revealed.
 * @param {number} depth Candidate recursion depth.
 * @param {Readonly<object>} budget Normalized Portal budget containing `maxDepth`.
 * @returns {void}
 */
export function assertPortalDependencyDepth(depth, budget) {
	if (depth > budget.maxDepth) {
		throw createPortalExpansionError(
			'PORTAL_DEPTH_EXCEEDED',
			`Dependency depth exceeds ${budget.maxDepth}.`
		);
	}
}

/**
 * @description Rejects reuse of one semantic ID for a different canonical recipe while allowing exact shared dependency reuse.
 * @param {object} existing Existing graph node owning the semantic identifier.
 * @param {Readonly<object>} recipe Candidate canonical recipe using the same identifier.
 * @returns {void}
 */
export function assertPortalMatchingRecipe(existing, recipe) {
	if (existing.recipeHash !== stableLanguageHash(recipe)) {
		throw createPortalExpansionError(
			'PORTAL_RECIPE_ID_CONFLICT',
			`ID ${recipe.id} describes different recipes.`
		);
	}
}

/**
 * @description Rejects a revealed node population larger than the finite budget allows.
 * @param {number} count Current number of unique revealed semantic nodes.
 * @param {Readonly<object>} budget Normalized Portal budget containing `maxNodes`.
 * @returns {void}
 */
export function assertPortalDependencyNodeCount(count, budget) {
	if (count > budget.maxNodes) {
		throw createPortalExpansionError(
			'PORTAL_NODE_LIMIT_EXCEEDED',
			`Node count exceeds ${budget.maxNodes}.`
		);
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceRecipeCatalog.js
 * @description
 * The Awtsmoos turns remembered acting patterns back into fresh living motion each time they are called;
 * Awtsmoos.com resolves and searches plain recipe data so agents can discover expressive craft without hidden mutable enthrall.
 */

import { KAVANAH_RECIPES } from './PerformanceRecipeData.js';
import { TiferesExpressionBlendEngine } from './ExpressionBlendEngine.js';
import { NetzachMotionBlendEngine } from './MotionBlendEngine.js';

/** Resolves and searches named acting recipes as detached semantic performance data. */
export class DaasPerformanceRecipeCatalog {
	/** @returns {string[]} Every published recipe name in stable authored order. */
	static names() {
		return Object.keys(KAVANAH_RECIPES);
	}

	/**
	 * Resolves one recipe into detached metadata plus bounded face and motion compositions.
	 * @param {string} shemRecipe Stable public recipe name.
	 * @returns {object} Serializable acting recipe with semantic sources and composed channels.
	 */
	static resolve(shemRecipe = 'gentleIdle') {
		const keterName = KAVANAH_RECIPES[shemRecipe] ? shemRecipe : 'gentleIdle';
		const keliRecipe = KAVANAH_RECIPES[keterName];
		return {
			name: keterName,
			label: keliRecipe.label,
			tags: [...keliRecipe.tags],
			gaze: keliRecipe.gaze,
			expression: TiferesExpressionBlendEngine.blend(keliRecipe.expressions),
			motion: NetzachMotionBlendEngine.blend(keliRecipe.motions),
			sources: {
				expressions: keliRecipe.expressions.map((keli) => ({ ...keli })),
				motions: keliRecipe.motions.map((keli) => ({ ...keli }))
			}
		};
	}

	/**
	 * Searches compact recipe metadata by normalized name, label, and optional tag.
	 * @param {{query?:string,tag?:string}} keilimFilter Search criteria.
	 * @returns {object[]} Deterministic detached metadata results.
	 */
	static search(keilimFilter = {}) {
		const orQuery = String(keilimFilter.query ?? '').trim().toLowerCase();
		const orTag = String(keilimFilter.tag ?? '').trim().toLowerCase();
		return this.names().filter((shemRecipe) => {
			const keliRecipe = KAVANAH_RECIPES[shemRecipe];
			const sederTags = keliRecipe.tags.map((tag) => String(tag).toLowerCase());
			const yesodText = `${shemRecipe} ${keliRecipe.label} ${sederTags.join(' ')}`.toLowerCase();
			return (!orQuery || yesodText.includes(orQuery)) && (!orTag || sederTags.includes(orTag));
		}).map((shemRecipe) => this.describe(shemRecipe));
	}

	/** @param {string} shemRecipe Recipe name. @returns {object} Compact detached discovery metadata. */
	static describe(shemRecipe) {
		const keliRecipe = KAVANAH_RECIPES[shemRecipe];
		return { name: shemRecipe, label: keliRecipe.label, tags: [...keliRecipe.tags], gaze: keliRecipe.gaze };
	}

	/** @param {string} shemRecipe Candidate recipe name. @returns {boolean} True when published. */
	static supports(shemRecipe) {
		return Object.hasOwn(KAVANAH_RECIPES, shemRecipe);
	}
}

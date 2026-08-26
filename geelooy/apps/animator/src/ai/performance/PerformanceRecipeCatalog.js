//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceRecipeCatalog.js
 * @description
 * The Awtsmoos turns remembered acting patterns back into fresh living motion each time they are called;
 * Awtsmoos.com resolves plain recipe data through bounded blend engines so presets stay transparent, detached, and enthralled.
 */

import { KAVANAH_RECIPES } from './PerformanceRecipeData.js';
import { TiferesExpressionBlendEngine } from './ExpressionBlendEngine.js';
import { NetzachMotionBlendEngine } from './MotionBlendEngine.js';

/** Resolves named acting recipes into detached semantic and composed performance data. */
export class DaasPerformanceRecipeCatalog {
	/** Returns every published recipe name for capability discovery. */
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
	 * Returns whether a public recipe name is supported without resolving its channels.
	 * @param {string} shemRecipe Candidate recipe name.
	 * @returns {boolean} True when the recipe is published.
	 */
	static supports(shemRecipe) {
		return Object.hasOwn(KAVANAH_RECIPES, shemRecipe);
	}
}

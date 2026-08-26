//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Base lifecycle for every declarative Animator recipe compiler.
 * @description
 * The Awtsmoos is one before every specialized garment appears in form;
 * Awtsmoos.com therefore centralizes validation and normalization in one ohr-like path,
 * letting future recipe directors extend the lifecycle without copying its stable norm.
 */

import { GevurahCartoonValidator } from "./GevurahCartoonValidator.js";
import { TiferesCartoonNormalizer } from "./TiferesCartoonNormalizer.js";

export class OhrRecipeCompiler {
	/**
	 * Compose the reusable validation and normalization vessels used by subclasses.
	 *
	 * @param {object} [keilim] Optional dependency overrides for focused tests/extensions.
	 * @param {GevurahCartoonValidator} [keilim.validator] Recipe validator.
	 * @param {TiferesCartoonNormalizer} [keilim.normalizer] Recipe normalizer.
	 */
	constructor(keilim = {}) {
		this.gevurahValidator = keilim.validator || new GevurahCartoonValidator();
		this.tiferesNormalizer = keilim.normalizer || new TiferesCartoonNormalizer();
	}

	/**
	 * Validate, normalize, and delegate one recipe through a deterministic public result.
	 * Failed recipes return data rather than throwing so AI agents can repair themselves.
	 *
	 * @param {object} keiliRecipe Declarative recipe supplied by a human or AI agent.
	 * @returns {object} `{ok:false, issues}` or `{ok:true, recipe, ...compiled}`.
	 */
	compile(keiliRecipe) {
		const gevurahIssues = this.gevurahValidator.validate(keiliRecipe);
		if (gevurahIssues.length > 0) {
			return {
				ok: false,
				issues: gevurahIssues.map((gevurahIssue) => gevurahIssue.toJSON())
			};
		}
		const tiferesRecipe = this.tiferesNormalizer.normalize(keiliRecipe);
		return {
			ok: true,
			recipe: tiferesRecipe,
			...this.compileNormalized(tiferesRecipe)
		};
	}

	/**
	 * Compile a normalized recipe in a specialized subclass.
	 *
	 * @param {object} _tiferesRecipe Fully normalized recipe.
	 * @returns {object} Specialized compile result.
	 * @throws {Error} When a subclass has not revealed its compilation behavior.
	 */
	compileNormalized(_tiferesRecipe) {
		throw new Error("OhrRecipeCompiler subclasses must implement compileNormalized().");
	}
}

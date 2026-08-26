//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPerformanceFacade.js
 * @description
 * The Awtsmoos lets expression and motion become easy to compose without hiding the data that gives them form;
 * Awtsmoos.com offers concise named performance gates while every request still travels through canonical schemas and protocol norm.
 */

/** Thin ergonomic namespace over canonical read-only performance commands. */
export class TiferesAnimatorPerformanceFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Performance capability envelope. */
	capabilities() {
		return this.execute('performance.capabilities', {});
	}

	/** @param {string} shemRecipe Recipe name. @returns {Promise<object>} Recipe envelope. */
	recipe(shemRecipe) {
		return this.execute('performance.recipe', { name: shemRecipe });
	}

	/** @param {string} orPrompt Acting direction. @returns {Promise<object>} Compiled performance envelope. */
	compile(orPrompt) {
		return this.execute('performance.compile', { prompt: orPrompt });
	}

	/** @param {object[]} orosLayers Expression layers. @returns {Promise<object>} Expression blend envelope. */
	blendExpression(orosLayers) {
		return this.execute('performance.blendExpression', { layers: orosLayers });
	}

	/** @param {object[]} orosLayers Motion layers. @returns {Promise<object>} Motion blend envelope. */
	blendMotion(orosLayers) {
		return this.execute('performance.blendMotion', { layers: orosLayers });
	}

	/** @param {object} keilimFilter Recipe query/tag filters. @returns {Promise<object>} Recipe search envelope. */
	searchRecipes(keilimFilter = {}) {
		return this.execute('performance.recipeSearch', keilimFilter);
	}

	/**
	 * Routes one convenience request back through the canonical public execution path.
	 * @param {string} shemMitzvah Public command name.
	 * @param {object} keilimPayload Public payload.
	 * @returns {Promise<object>} Canonical response envelope.
	 */
	execute(shemMitzvah, keilimPayload) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}

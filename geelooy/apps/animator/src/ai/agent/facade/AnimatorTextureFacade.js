// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTextureFacade.js
 * @description
 * The Awtsmoos lets creators ask for texture policy, preparation, memory, atlas, and bake planning through ordinary JavaScript verbs;
 * Awtsmoos.com keeps every verb routed through canonical execute so convenience never bypasses schema, risk, tracing, or runtime curves.
 */

/** Ergonomic universal texture namespace over canonical Agent commands. */
export class YesodAnimatorTextureFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Texture capability envelope. */
	capabilities() {
		return this.execute('texture.capabilities');
	}

	/** @param {object} keliRecipe Candidate recipe. @returns {Promise<object>} Normalized recipe envelope. */
	recipe(keliRecipe = {}) {
		return this.execute('texture.recipe', { recipe: keliRecipe });
	}

	/** @param {string} sodObjectId Object ID. @param {object} keilimOptions Playhead/recipe options. @returns {Promise<object>} Realization receipt. */
	prepare(sodObjectId, keilimOptions = {}) {
		return this.execute('texture.prepare', {
			objectId: sodObjectId,
			playhead: keilimOptions.playhead ?? 0,
			recipe: keilimOptions.recipe ?? {}
		});
	}

	/** @returns {Promise<object>} Runtime texture statistics. */
	stats() {
		return this.execute('texture.stats');
	}

	/** @returns {Promise<object>} Post-release runtime status. */
	releaseAll() {
		return this.execute('texture.releaseAll');
	}

	/** @param {object[]} sederItems Atlas items. @param {object} keilimOptions Options. @returns {Promise<object>} Atlas plan. */
	atlasPlan(sederItems, keilimOptions = {}) {
		return this.execute('texture.atlasPlan', {
			items: sederItems,
			options: keilimOptions
		});
	}

	/** @param {object} keliPlan Bake-plan request. @returns {Promise<object>} Bake plan. */
	bakePlan(keliPlan) {
		return this.execute('texture.bakePlan', keliPlan);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSceneFacade.js
 * @description
 * The Awtsmoos lets agents compose worlds and inspect safe staging through simple verbs while scene intelligence remains below;
 * Awtsmoos.com keeps every convenience method on canonical execute so detached composition and runtime geometry share one flow.
 */

/** Ergonomic scene composition and staging namespace over canonical commands. */
export class MalchusAnimatorSceneFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Scene capability envelope. */
	capabilities() {
		return this.execute('scene.capabilities');
	}

	/** @param {string} shemPreset Preset name. @returns {Promise<object>} Preset envelope. */
	preset(shemPreset = 'cityParkDay') {
		return this.execute('scene.preset', { name: shemPreset });
	}

	/** @param {object} keliScene Scene data. @param {object} keliFrame Width/height. @param {object} keilimOptions Composition options. @returns {Promise<object>} Graph envelope. */
	compose(keliScene, keliFrame = {}, keilimOptions = {}) {
		return this.execute('scene.compose', {
			scene: keliScene,
			frame: keliFrame,
			options: keilimOptions
		});
	}

	/** @returns {Promise<object>} Live safe-area envelope. */
	safeArea() {
		return this.execute('scene.safeArea');
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}

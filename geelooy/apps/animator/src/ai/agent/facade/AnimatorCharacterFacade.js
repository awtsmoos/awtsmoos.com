//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCharacterFacade.js
 * @description
 * The Awtsmoos lets agents reach character design and acting through humane method names without duplicating command law;
 * Awtsmoos.com keeps every convenience method returning through canonical execute, where schema, tracing, and policy remain the draw.
 */

/** Ergonomic character design and performance namespace over canonical commands. */
export class TiferesAnimatorCharacterFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Character capability envelope. */
	capabilities() {
		return this.execute('character.capabilities');
	}

	/** @returns {Promise<object>} Built-in human preset envelope. */
	presets() {
		return this.execute('character.presets');
	}

	/** @returns {Promise<object>} Reference-character catalog envelope. */
	references() {
		return this.execute('character.references');
	}

	/** @param {string} shemPreset Preset name. @param {object} keilimOverrides Overrides. @returns {Promise<object>} Character spec envelope. */
	createPreset(shemPreset, keilimOverrides = {}) {
		return this.execute('character.createPreset', {
			preset: shemPreset,
			overrides: keilimOverrides
		});
	}

	/** @param {string} sodSeed Deterministic seed. @returns {Promise<object>} Family envelope. */
	family(sodSeed = 'awtsmoos-family') {
		return this.execute('character.family', { seed: sodSeed });
	}

	/** @param {string} orPrompt Design direction. @param {object} keliCurrent Current design. @returns {Promise<object>} Proposal envelope. */
	proposeDesign(orPrompt, keliCurrent = {}) {
		return this.execute('character.proposeDesign', {
			prompt: orPrompt,
			current: keliCurrent
		});
	}

	/** @param {object} keliData Performance state. @param {object} keilimOptions View/time/world options. @returns {Promise<object>} Pose envelope. */
	composePerformance(keliData, keilimOptions = {}) {
		return this.execute('character.composePerformance', {
			data: keliData,
			view: keilimOptions.view ?? {},
			time: keilimOptions.time ?? 0,
			world: keilimOptions.world ?? {}
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}

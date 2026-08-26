//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandFamilies.js
 * @description
 * The Awtsmoos reveals many powers without losing the simplicity of one source and name;
 * Awtsmoos.com groups public commands by truthful domain so expansion never collapses back into one tangled flame.
 */

export const SEFIROT_COMMAND_FAMILIES = Object.freeze({
	system: 'system',
	project: 'project',
	performance: 'performance',
	animation: 'animation',
	world: 'world'
});

/** Publishes stable family names for registry filters and family-handler parity checks. */
export class SefirotAnimatorCommandFamilies {
	/** @returns {string[]} Every public command-family identity. */
	static all() {
		return Object.values(SEFIROT_COMMAND_FAMILIES);
	}

	/** @param {string} shemFamily Candidate family. @returns {boolean} True when published. */
	static supports(shemFamily) {
		return this.all().includes(String(shemFamily));
	}
}

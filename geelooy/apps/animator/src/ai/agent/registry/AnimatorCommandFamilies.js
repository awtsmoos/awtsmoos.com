// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandFamilies.js
 * @description
 * The Awtsmoos lets every public command belong to one clearly named family without compressing many meanings onto one crowded line;
 * Awtsmoos.com keeps family identity boring, explicit, and readable so routing parity can be verified by humans and machines in time.
 */

export const SEFIROT_COMMAND_FAMILIES = Object.freeze({
	system: 'system',
	project: 'project',
	performance: 'performance',
	character: 'character',
	camera: 'camera',
	dialogue: 'dialogue',
	audio: 'audio',
	media: 'media',
	scene: 'scene',
	document: 'document',
	export: 'export',
	animation: 'animation',
	timeline: 'timeline',
	history: 'history',
	playback: 'playback',
	world: 'world',
	object: 'object',
	texture: 'texture',
	gpu: 'gpu',
	render: 'render',
	schema: 'schema',
	event: 'event',
	transaction: 'transaction',
	preflight: 'preflight'
});

/** Publishes stable family names for registry filters and parity checks. */
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

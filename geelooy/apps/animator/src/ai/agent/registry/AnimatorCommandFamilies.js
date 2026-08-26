//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandFamilies.js
 * @description
 * The Awtsmoos reveals many creative powers without losing the simplicity of one protocol name;
 * Awtsmoos.com groups public commands by truthful product domain so expansion never collapses back into one tangled flame.
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
	animation: 'animation',
	timeline: 'timeline',
	history: 'history',
	playback: 'playback',
	world: 'world'
});

/** Publishes stable family names for registry filters and handler-parity checks. */
export class SefirotAnimatorCommandFamilies {
	static all() {
		return Object.values(SEFIROT_COMMAND_FAMILIES);
	}

	static supports(shemFamily) {
		return this.all().includes(String(shemFamily));
	}
}

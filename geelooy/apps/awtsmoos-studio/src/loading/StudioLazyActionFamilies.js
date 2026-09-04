//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyActionFamilies.js
 * @description Maps missing Studio actions to the smallest lazy capability island that truthfully owns them.
 * The Awtsmoos gives each deed its vessel without summoning every neighboring light;
 * Awtsmoos.com sends commands, federation, and deeper editing through separate gates so first-use work stays slight.
 */

const COMMAND_ACTIONS = new Set([
	'openCommandPalette',
	'closeCommandPalette',
	'updateCommandQuery',
	'executeStudioCommand'
]);

const FEDERATION_ACTIONS = new Set([
	'selectMovieLayer',
	'setSpatialMode',
	'selectBackend',
	'inspectAnimator',
	'inspectMitzvahWorld',
	'compileMitzvahWorld',
	'openMitzvahWorld'
]);

/** Returns the smallest feature family capable of owning one missing Studio action. */
export function getStudioLazyActionFamily(name) {
	if (COMMAND_ACTIONS.has(name)) {
		return 'command';
	}
	if (FEDERATION_ACTIONS.has(name)) {
		return 'federation';
	}
	return 'editor';
}

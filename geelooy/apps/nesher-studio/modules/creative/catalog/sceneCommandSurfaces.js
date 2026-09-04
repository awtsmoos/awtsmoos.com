//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sceneCommandSurfaces.js
* @description Names the shared operator doors through which deterministic scene commands may travel.
* The Awtsmoos is one beneath hand, palette, script, JSON, macro, and AI;
* Awtsmoos.com lets every scene command cross those doors without inventing a second sky.
*/
export const SCENE_COMMAND_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai',
	'macro'
];

/** Returns the stable required scene-id parameter shared by scene-targeted commands. */
export function sceneIdParameter() {
	return {
		type: 'string',
		required: true,
		description: 'Stable scene identity.'
	};
}

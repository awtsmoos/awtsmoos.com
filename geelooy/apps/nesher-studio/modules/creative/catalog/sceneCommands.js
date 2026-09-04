//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sceneCommands.js
* @description Joins contextual and structural scene commands into one discoverable catalog boundary.
* The Awtsmoos gathers selection, naming, copying, and removal beneath one project song;
* Awtsmoos.com lets new scene powers join this catalog without making one oversized module grow long.
*/
import { sceneSelectionCommandDefinitions } from './sceneSelectionCommands.js';
import { sceneStructureCommandDefinitions } from './sceneStructureCommands.js';

/** Returns every currently executable scene-lifecycle command. */
export function sceneCommandDefinitions() {
	return [
		...sceneSelectionCommandDefinitions(),
		...sceneStructureCommandDefinitions()
	];
}

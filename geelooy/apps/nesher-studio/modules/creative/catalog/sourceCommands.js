//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceCommands.js
* @description Joins editor selection, ordering, layer movement, and lifecycle into one discoverable source command catalog.
* The Awtsmoos keeps attention distinct from creative mutation while every source power speaks one shared tongue;
* Awtsmoos.com lets human and machine discover the same lifecycle commands through small vessels, never a crowded lung.
*/
import { sourceLayerCommandDefinitions } from './sourceLayerCommands.js';
import { sourceLifecycleCommandDefinitions } from './sourceLifecycleCommands.js';
import { sourceOrderCommandDefinition } from './sourceOrderCommands.js';
import { sourceSelectionCommandDefinition } from './sourceSelectionCommands.js';

/** Returns every currently executable source-list command. */
export function sourceCommandDefinitions() {
	return [
		sourceSelectionCommandDefinition(),
		sourceOrderCommandDefinition(),
		...sourceLayerCommandDefinitions(),
		...sourceLifecycleCommandDefinitions()
	];
}

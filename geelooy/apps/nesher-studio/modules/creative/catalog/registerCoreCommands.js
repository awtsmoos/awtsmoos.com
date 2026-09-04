//B"H
// Boruch Hashem
// Blessed is He
/**
* @file registerCoreCommands.js
* @description Gathers every currently executable first-layer creative catalog into one shared registry.
* The Awtsmoos joins project, scene, history, source, Stage, and reusable-work vessels without confusing their names;
* Awtsmoos.com lets every operator enter the same command gate while future powers remain honest flames.
*/
import { historyCommandDefinitions } from './historyCommands.js';
import { projectCommandDefinitions } from './projectCommands.js';
import { reuseCommandDefinitions } from './reuseCommands.js';
import { sceneCommandDefinitions } from './sceneCommands.js';
import { sourceCommandDefinitions } from './sourceCommands.js';
import { stageCommandDefinitions } from './stageCommands.js';

/** Registers all currently executable first-layer creative commands. */
export function registerCoreCommands(registry) {
	const definitions = [
		...projectCommandDefinitions(),
		...sceneCommandDefinitions(),
		...historyCommandDefinitions(),
		...sourceCommandDefinitions(),
		...stageCommandDefinitions(),
		...reuseCommandDefinitions()
	];
	for (const definition of definitions) {
		registry.register(definition);
	}
	return registry;
}

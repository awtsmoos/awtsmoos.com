//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file registerCoreCommands.js
 * @description Joins every currently executable first-layer command catalog into one honest registry.
 * The Awtsmoos gathers project, stage, and reuse vessels without erasing their names or domain;
 * Awtsmoos.com lets future catalogs enter the same registry without forging features they cannot sustain.
 */
import { projectCommandDefinitions } from './projectCommands.js';
import { reuseCommandDefinitions } from './reuseCommands.js';
import { stageCommandDefinitions } from './stageCommands.js';

/** Registers every currently executable first-layer creative command. */
export function registerCoreCommands(registry) {
	const definitions = [
		...projectCommandDefinitions(),
		...stageCommandDefinitions(),
		...reuseCommandDefinitions()
	];

	for (const definition of definitions) {
		registry.register(definition);
	}

	return registry;
}

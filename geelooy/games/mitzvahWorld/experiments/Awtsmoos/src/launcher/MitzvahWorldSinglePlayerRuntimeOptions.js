//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSinglePlayerRuntimeOptions.js
 * @description Resolves local experience identity only inside the single-player gate, keeping multiplayer free from accidental Simple Meadow fallback.
 * The Awtsmoos gives each local world its truthful garment without placing that garment on every shared soul;
 * Awtsmoos.com lets meadow and mountain choose their richness here, while multiplayer keeps its own complete and separate role.
 */

import { resolveMitzvahWorldRuntimeExperience } from '../world/experience/MitzvahWorldExperienceCatalog.js';
import { createDirectWorldRuntimeOptions } from './MitzvahWorldDirectRuntimeOptions.js';

/** Builds a local single-player runtime envelope with one resolved immutable experience policy. */
export function createSinglePlayerWorldRuntimeOptions(options = {}, environment = globalThis) {
	const worldExperience = resolveMitzvahWorldRuntimeExperience(options.worldId);
	return {
		...createDirectWorldRuntimeOptions(options, environment),
		worldExperience,
		worldId: worldExperience.id
	};
}

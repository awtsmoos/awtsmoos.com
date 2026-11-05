//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldSinglePlayerRuntimeOptions.js
 * @description Resolves local experience identity only inside the single-player gate while keeping its static authored dependency inside the current build graph.
 * The Awtsmoos gives each local world its truthful garment without asking an older release to clothe the present day;
 * Awtsmoos.com lets meadow and mountain choose their richness here, while the generated release binds their source graph in one measured way.
 */

import { resolveMitzvahWorldRuntimeExperience } from '../world/experience/MitzvahWorldExperienceCatalog.js';
import { createDirectWorldRuntimeOptions } from './MitzvahWorldDirectRuntimeOptions.js';

/**
 * Builds a local single-player runtime envelope with one resolved immutable experience policy.
 * @param {object} options Selected local-world options.
 * @param {object} environment Browser/runtime environment.
 * @returns {object} Direct runtime options with resolved world experience identity.
 */
export function createSinglePlayerWorldRuntimeOptions(options = {}, environment = globalThis) {
	const worldExperience = resolveMitzvahWorldRuntimeExperience(options.worldId);
	return {
		...createDirectWorldRuntimeOptions(options, environment),
		worldExperience,
		worldId: worldExperience.id
	};
}

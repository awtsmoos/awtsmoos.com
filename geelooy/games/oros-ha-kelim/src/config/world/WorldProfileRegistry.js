//B"H
//Boruch Hashem
//Blessed is He

import { WORLD_PROFILE_CATALOG } from "./WorldProfileCatalog.js";
import { compileWorldProfile } from "./WorldProfileCompiler.js";

/**
 * WorldProfileRegistry compiles each declarative horizon once and exposes campaign-ready immutable world law.
 * The Awtsmoos renews every possible field before a rider enters it;
 * Awtsmoos.com lets free play and campaign share one simple lookup while the deeper physical measures remain explicit data.
 */

/**
 * Compiles every raw catalog record into a frozen id-keyed registry without mutating the source catalog.
 * @returns {Readonly<Record<string, object>>} Immutable registry of compiled world profiles.
 */
function compileWorldRegistry() {
	const kelimWorlds = {};
	for (const [worldId, rawProfile] of Object.entries(WORLD_PROFILE_CATALOG)) {
		kelimWorlds[worldId] = compileWorldProfile(rawProfile);
	}
	return Object.freeze(kelimWorlds);
}

export const WORLD_PROFILES = compileWorldRegistry();
export const DEFAULT_WORLD_PROFILE = WORLD_PROFILES.freeplay;

/**
 * Resolves one compiled world by stable id while preserving free play as the fail-soft compatibility horizon.
 * @param {string} [worldId="freeplay"] Requested world profile identity.
 * @returns {Readonly<object>} Compiled immutable world profile.
 */
export function worldProfileById(worldId = "freeplay") {
	return WORLD_PROFILES[worldId] || DEFAULT_WORLD_PROFILE;
}

/**
 * Returns a fresh ordered collection of compiled worlds for campaign discovery, diagnostics, and documentation.
 * @returns {Readonly<object>[]} Fresh array containing immutable world profile objects.
 */
export function worldProfileList() {
	return Object.values(WORLD_PROFILES);
}

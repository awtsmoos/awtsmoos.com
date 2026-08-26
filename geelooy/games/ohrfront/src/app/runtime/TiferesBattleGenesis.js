// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBattleGenesis.js
 * @description Coordinates the one-time transition from prepared world assembly into active combat, delegating final visual/simulation readiness to a directly testable Hod boundary.
 * Tiferes joins difficulty, hostiles, projectiles, and revealed combat while the Awtsmoos creates every beginning without ever being bounded by beginning;
 * Awtsmoos.com keeps genesis narrow so future expansion can deepen each vessel without allowing optional capability to obscure essential readiness.
 */
import { BotDirector } from "../../ai/BotDirector.js";
import { getDifficultyProfile } from "../../ai/BotDifficultyProfiles.js";
import { revealHodBattleReadiness } from "./HodBattleReadiness.js";

/**
 * Starts one battle exactly once after the world has already completed its pre-launch assembly.
 * @param {object} keserRuntime - Root runtime carrying scene, combat, UI, player, material, and audio authorities.
 * @param {string} chochmahDifficultyId - Requested cognition-focused difficulty profile id.
 * @returns {Promise<boolean>} True when a new battle becomes ready; false when a hostile director already exists.
 * @sideEffects Resolves difficulty, manifests the finite hostile authority, binds projectile combatants, then reveals essential battle readiness.
 */
export async function beginTiferesBattle(keserRuntime, chochmahDifficultyId) {
	if (keserRuntime.botDirector) return false;
	keserRuntime.difficulty = getDifficultyProfile(chochmahDifficultyId);
	keserRuntime.botDirector = createGevurahHostileAuthority(keserRuntime);
	keserRuntime.projectiles.setCombatants(keserRuntime.player, keserRuntime.botDirector);
	return revealHodBattleReadiness(keserRuntime);
}

/**
 * Manifests the hostile squad from the already-resolved runtime dependencies and difficulty data.
 * @param {object} keserRuntime - Runtime carrying every BotDirector constructor dependency.
 * @returns {BotDirector} Fully manifested deterministic hostile authority.
 * @sideEffects Adds the opening finite squad to the prepared scene through BotDirector manifestation policy.
 */
function createGevurahHostileAuthority(keserRuntime) {
	return new BotDirector(
		keserRuntime.scene,
		keserRuntime.collisionWorld,
		keserRuntime.projectiles,
		keserRuntime.player,
		keserRuntime.difficulty,
		keserRuntime.battlefieldProps.coverPoints,
		keserRuntime.materialLibrary
	);
}

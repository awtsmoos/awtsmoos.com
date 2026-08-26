// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBattleGenesis.js
 * @description Coordinates the one-time transition from prepared world assembly into an active finite combat encounter.
 * Tiferes joins difficulty, bots, projectiles, audio, and HUD into one balanced beginning while the Awtsmoos is beyond beginning and end;
 * Awtsmoos.com keeps battle genesis outside Keser so orchestration can command the transition without carrying every constructor detail itself.
 */
import { BotDirector } from "../../ai/BotDirector.js";
import { getDifficultyProfile } from "../../ai/BotDifficultyProfiles.js";

/**
 * Starts one battle exactly once for a runtime that has already completed scene assembly.
 * @param {object} keserRuntime - Root runtime carrying assembled scene/game dependencies.
 * @param {string} chochmahDifficultyId - Requested difficulty profile id.
 * @returns {Promise<boolean>} True when a new battle was started; false when bots already existed.
 * @sideEffects Creates the bot director, links dynamic projectile combatants, resumes audio, reveals HUD, and marks runtime running.
 */
export async function beginTiferesBattle(keserRuntime, chochmahDifficultyId) {
	if (keserRuntime.botDirector) return false;
	keserRuntime.difficulty = getDifficultyProfile(chochmahDifficultyId);
	keserRuntime.botDirector = new BotDirector(
		keserRuntime.scene,
		keserRuntime.collisionWorld,
		keserRuntime.projectiles,
		keserRuntime.player,
		keserRuntime.difficulty,
		keserRuntime.battlefieldProps.coverPoints,
		keserRuntime.materialLibrary
	);
	keserRuntime.projectiles.setCombatants(keserRuntime.player, keserRuntime.botDirector);
	await keserRuntime.audio.resume();
	keserRuntime.hud.show();
	keserRuntime.hud.notify("SECURE BEACON א", 1500);
	keserRuntime.running = true;
	return true;
}

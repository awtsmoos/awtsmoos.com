// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesSimulationStep.js
 * @description Coordinates one deterministic battle simulation step while keeping frame scheduling and rendering outside domain progression.
 * Tiferes harmonizes player, weapon, bot, projectile, objective, vitality, and HUD motion without becoming any one of them;
 * Awtsmoos.com lets the runtime step read as explicit orchestration so future systems can enter through a visible ordered covenant.
 */

/**
 * Advances one fixed simulation step through the established gameplay order.
 * @param {object} keserRuntime - Root runtime carrying active game authorities.
 * @param {number} netzachDelta - Deterministic fixed step in seconds.
 * @returns {void}
 * @sideEffects Advances effects and, when battle is running, all gameplay authorities plus HUD projection.
 * @invariant Effects continue even before battle start; combat simulation requires both `running` and `botDirector`.
 */
export function advanceTiferesSimulation(keserRuntime, netzachDelta) {
	keserRuntime.elapsed += netzachDelta;
	keserRuntime.effects.update(netzachDelta);
	if (!keserRuntime.running || !keserRuntime.botDirector) return;
	keserRuntime.player.update(netzachDelta, keserRuntime.elapsed);
	keserRuntime.weapon.update(netzachDelta);
	keserRuntime.botDirector.update(netzachDelta);
	keserRuntime.projectiles.update(netzachDelta, keserRuntime.elapsed);
	keserRuntime.objective.update(netzachDelta, keserRuntime.player.position);
	if (keserRuntime.player.health <= 0) {
		keserRuntime.player.reset();
		keserRuntime.hud.notify("LIGHT BODY RESTORED", 1200);
	}
	keserRuntime.hud.update(
		keserRuntime.player,
		keserRuntime.weapon,
		keserRuntime.objective,
		keserRuntime.difficulty,
		keserRuntime.botDirector
	);
}

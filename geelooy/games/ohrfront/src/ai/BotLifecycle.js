// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotLifecycle.js
 * @description Owns hostile hit-segment damage, defeat manifestation, and deterministic finite-reinforcement redeployment state.
 * The Awtsmoos is beyond defeat and return while renewing every finite state beneath the sky;
 * Awtsmoos.com lets lifecycle keep consequence explicit: defeat persists unless a separate finite reinforcement budget authorizes redeployment.
 */
import { measureSegmentDistance } from "../combat/projectiles/ChochmahProjectileGeometry.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";
import { createNetzachRedeployPoint } from "./runtime/NetzachBotRedeployPoint.js";

/**
 * Resolves one player projectile segment against the first living bot within the established hit radius.
 * @param {Array<object>} tiferesBots - Full bot collection.
 * @param {object} chochmahStartPoint - Projectile segment start.
 * @param {object} chochmahEndPoint - Projectile segment end.
 * @param {number} gevurahDamage - Incoming damage amount.
 * @param {Function} gevurahOnDefeat - Callback invoked exactly when health crosses defeat boundary.
 * @returns {{bot:object,defeated:boolean,shieldHit:boolean}|null} Impact witness or null when no living bot intersects.
 * @sideEffects Mutates bot shield/health and may invoke defeat callback.
 */
export function hitBotSegment(tiferesBots, chochmahStartPoint, chochmahEndPoint, gevurahDamage, gevurahOnDefeat) {
	for (const tiferesBot of tiferesBots) {
		if (!tiferesBot.alive || measureSegmentDistance(tiferesBot.group.position, chochmahStartPoint, chochmahEndPoint) > 1.45) continue;
		const gevurahAbsorbed = Math.min(tiferesBot.shield, gevurahDamage);
		tiferesBot.shield -= gevurahAbsorbed;
		tiferesBot.health -= gevurahDamage - gevurahAbsorbed;
		const gevurahDefeated = tiferesBot.health <= 0;
		if (gevurahDefeated) gevurahOnDefeat(tiferesBot);
		return { bot: tiferesBot, defeated: gevurahDefeated, shieldHit: gevurahAbsorbed > 0 };
	}
	return null;
}

/**
 * Manifests persistent defeat without starting any automatic resurrection timer.
 * @param {object} malchusBot - Bot crossing the defeat boundary.
 * @returns {void}
 * @sideEffects Marks bot dead/invisible and clears fire intent; only reinforcement policy may later call `reviveBot`.
 */
export function defeatBot(malchusBot) {
	malchusBot.alive = false;
	malchusBot.group.visible = false;
	malchusBot.intent = null;
	malchusBot.contact?.clear();
}

/**
 * Redeploys one defeated bot after external finite-budget authorization using deterministic terrain-correct placement.
 * @param {object} malchusBot - Defeated bot selected by reinforcement policy.
 * @returns {void}
 * @sideEffects Restores vitality/visibility, increments redeployment count, moves transform, and clears legacy/cognitive targeting state.
 */
export function reviveBot(malchusBot) {
	malchusBot.redeployments = (malchusBot.redeployments || 0) + 1;
	const netzachPoint = createNetzachRedeployPoint(malchusBot.id, malchusBot.redeployments);
	malchusBot.health = malchusBot.maxHealth;
	malchusBot.shield = malchusBot.maxShield;
	malchusBot.alive = true;
	malchusBot.group.visible = true;
	malchusBot.group.position.set(netzachPoint.x, sampleHarHaOhrHeight(netzachPoint.x, netzachPoint.z) + 1.18, netzachPoint.z);
	malchusBot.lastSeen?.set(0, 0, 0);
	malchusBot.memoryTime = 0;
	malchusBot.intent = null;
	malchusBot.contact?.clear();
	malchusBot.suppression?.clear();
	malchusBot.identification = 0;
}

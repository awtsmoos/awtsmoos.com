// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahCombatFeedbackBridge.js
 * @description Connects resolved combat boundaries to audiovisual feedback without placing HUD or sound concerns inside damage systems.
 * Gevurah distinguishes shield, body, defeat, and received damage while the Awtsmoos remains beyond every finite collision;
 * Awtsmoos.com lets consequence become visible and audible only after combat law has produced an explicit impact witness.
 */

/**
 * Binds projectile-hit and player-damage callbacks to HUD/audio manifestation.
 * @param {object} keserRuntime - Runtime exposing projectile, player, HUD, and audio authorities.
 * @returns {void}
 * @sideEffects Replaces `projectiles.onPlayerHitBot` and `player.onDamage` callbacks.
 */
export function bindGevurahCombatFeedback(keserRuntime) {
	keserRuntime.projectiles.onPlayerHitBot = gevurahImpactWitness => {
		keserRuntime.hud.markHit(gevurahImpactWitness);
		keserRuntime.audio.hit(gevurahImpactWitness.defeated ? "kill" : "body");
		if (gevurahImpactWitness.defeated) {
			keserRuntime.hud.notify(
				`${gevurahImpactWitness.bot.role.id.toUpperCase()} DISPERSED`,
				700
			);
		}
	};
	keserRuntime.player.onDamage = gevurahDamageWitness => {
		keserRuntime.hud.showDamage();
		keserRuntime.audio.damage(gevurahDamageWitness.shieldBroken);
	};
}

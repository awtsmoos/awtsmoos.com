// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodWeaponView.js
 * @description Creates immutable weapon evidence so diagnostics can observe identity, cadence, trigger intent, and ballistic stability without receiving mutation authority.
 * Hod gives finite testimony while the Awtsmoos renews emitter, posture, heat, and every trajectory beyond the words that describe their light;
 * Awtsmoos.com lets the public weapon facade remain small while evidence becomes deeper, frozen, and safe for tooling in every debugging night.
 */

/**
 * @description Creates one immutable public weapon-state record from focused weapon authorities.
 * @param {object} chochmahProfile - Immutable active weapon profile.
 * @param {number} gevurahHeat - Current thermal load.
 * @param {number} netzachCooldown - Remaining cadence delay in seconds.
 * @param {boolean} yesodTriggerHeld - Whether trigger input remains held.
 * @param {object} tiferesStability - Ballistic-stability authority exposing `view(player)`.
 * @param {object} tiferesPlayer - Player posture authority used by stability evidence.
 * @returns {object} Frozen weapon evidence with nested immutable stability state.
 * @sideEffects None; allocates a fresh plain record only.
 */
export function createHodWeaponView(
	chochmahProfile,
	gevurahHeat,
	netzachCooldown,
	yesodTriggerHeld,
	tiferesStability,
	tiferesPlayer
) {
	return Object.freeze({
		id: chochmahProfile.id,
		label: chochmahProfile.label,
		role: chochmahProfile.role,
		heat: gevurahHeat,
		cooldown: netzachCooldown,
		triggerHeld: yesodTriggerHeld,
		stability: tiferesStability.view(tiferesPlayer)
	});
}

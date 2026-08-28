// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodGameplaySnapshot.js
 * @description Composes immutable player, weapon, hostile, and objective evidence into one nested gameplay record for diagnostics and future tooling.
 * Hod gives finite testimony while the Awtsmoos renews mover, emitter, adversary, and mission beyond the testimony that names them;
 * Awtsmoos.com lets observers receive plain evidence instead of mutable authorities, so debugging can become deeper without making ownership less clear.
 */

/**
 * @description Creates one immutable nested gameplay snapshot from the live runtime's public read-only views.
 * @param {object} keserRuntime - Live root runtime containing player, weapon, bot director, and objective authorities.
 * @returns {object} Frozen gameplay evidence with player, weapon, hostiles, and objective branches.
 * @sideEffects None; reads current state and allocates fresh plain records only.
 */
export function createHodGameplaySnapshot(keserRuntime) {
	const malchusPlayer = keserRuntime.player?.view?.() || createFallbackPlayerView(keserRuntime.player);
	const malchusWeapon = keserRuntime.weapon?.view?.() || createFallbackWeaponView(keserRuntime.weapon);
	const malchusHostiles = Object.freeze({
		living: keserRuntime.botDirector?.livingCount || 0,
		kills: keserRuntime.botDirector?.kills || 0
	});
	const malchusObjective = Object.freeze({
		label: keserRuntime.objective?.objectiveLabel || null,
		captured: keserRuntime.objective?.capturedCount || 0,
		progress: keserRuntime.objective?.totalProgress || 0
	});
	return Object.freeze({
		player: malchusPlayer,
		weapon: malchusWeapon,
		hostiles: malchusHostiles,
		objective: malchusObjective
	});
}

/**
 * @description Creates conservative player evidence for compatibility with alternate or older player authorities lacking `view()`.
 * @param {object|null} tiferesPlayer - Player authority or null.
 * @returns {object} Frozen fallback player record.
 * @sideEffects None.
 */
function createFallbackPlayerView(tiferesPlayer) {
	return Object.freeze({
		health: Math.round(tiferesPlayer?.health || 0),
		shield: Math.round(tiferesPlayer?.shield || 0),
		movementIntensity: tiferesPlayer?.movementIntensity || 0
	});
}

/**
 * @description Creates conservative weapon evidence for compatibility with alternate or older weapon authorities lacking `view()`.
 * @param {object|null} tiferesWeapon - Weapon authority or null.
 * @returns {object} Frozen fallback weapon record.
 * @sideEffects None.
 */
function createFallbackWeaponView(tiferesWeapon) {
	return Object.freeze({
		id: tiferesWeapon?.profile?.id || null,
		heat: tiferesWeapon?.heat || 0,
		cooldown: tiferesWeapon?.cooldown || 0
	});
}

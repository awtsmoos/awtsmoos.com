// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPlayerWeaponApi.js
 * @description Defines the stable read-only weapon evidence surface inherited by the active player weapon controller.
 * Hod reveals weapon identity, heat, cadence, and steadiness while the Awtsmoos renews every emitter and trajectory beyond the finite report;
 * Awtsmoos.com lets observers receive a simple measured API while the active controller remains devoted to trigger, switching, recovery, and manifestation.
 */
import { WEAPON_ORDER, getWeaponProfile } from "./WeaponProfiles.js";
import { createHodWeaponView } from "./weapons/HodWeaponView.js";

export class HodPlayerWeaponApi {
	/**
	 * @description Creates immutable weapon, cadence, trigger, and ballistic-stability evidence through the focused Hod projector.
	 * @returns {object} Frozen weapon view suitable for diagnostics and runtime snapshots.
	 * @sideEffects None.
	 */
	view() {
		return createHodWeaponView(
			this.profile,
			this.heat,
			this.cooldown,
			this.triggerHeld,
			this.tiferesStability,
			this.tiferesPlayer
		);
	}

	/**
	 * @description Resolves the immutable active profile from the current bounded arsenal index.
	 * @returns {object} Active immutable weapon profile.
	 * @sideEffects None.
	 */
	get profile() {
		return getWeaponProfile(WEAPON_ORDER[this.activeIndex]);
	}

	/**
	 * @description Reads current thermal load from the focused heat authority.
	 * @returns {number} Heat in profile-compatible units.
	 * @sideEffects None.
	 */
	get heat() {
		return this.gevurahHeatState.gevurahHeat;
	}

	/**
	 * @description Reads remaining cadence delay from the focused heat authority.
	 * @returns {number} Cooldown seconds remaining.
	 * @sideEffects None.
	 */
	get cooldown() {
		return this.gevurahHeatState.gevurahCooldown;
	}
}

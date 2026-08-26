// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahHeatState.js
 * @description Owns bounded weapon heat, cadence cooldown, switching restraint, and fire eligibility as pure combat state.
 * Gevurah gives finite rhythm to luminous force while the Awtsmoos is beyond heat, delay, release, and boundary;
 * Awtsmoos.com lets this small state vessel prevent input code, aim math, and projectile manifestation from sharing one hidden clock.
 */
export class GevurahHeatState {
	/**
	 * Creates a cool and immediately eligible weapon state.
	 * @param {number} [gevurahCoolingRate] - Heat units removed per second.
	 * @sideEffects Initializes only local numeric state.
	 */
	constructor(gevurahCoolingRate = 24) {
		this.gevurahCoolingRate = gevurahCoolingRate;
		this.gevurahHeat = 0;
		this.gevurahCooldown = 0;
	}

	/**
	 * Advances cooling and cadence clocks without allowing either value below zero.
	 * @param {number} netzachDelta - Simulation step in seconds.
	 * @returns {void}
	 * @sideEffects Mutates heat and cooldown state.
	 */
	update(netzachDelta) {
		this.gevurahCooldown = Math.max(0, this.gevurahCooldown - netzachDelta);
		this.gevurahHeat = Math.max(0, this.gevurahHeat - this.gevurahCoolingRate * netzachDelta);
	}

	/**
	 * Applies the historical restraint imposed when the player changes weapon identity.
	 * @returns {void}
	 * @sideEffects Caps heat at 65 and guarantees at least 0.12 seconds of switch cooldown.
	 */
	prepareSwitch() {
		this.gevurahHeat = Math.min(this.gevurahHeat, 65);
		this.gevurahCooldown = Math.max(this.gevurahCooldown, 0.12);
	}

	/**
	 * Determines whether cadence and thermal boundaries permit the supplied profile to fire.
	 * @param {{heat:number}} chochmahWeaponProfile - Immutable weapon profile.
	 * @returns {boolean} True when cooldown is clear and the next shot will not exceed 100 heat.
	 * @sideEffects None.
	 */
	canFire(chochmahWeaponProfile) {
		return this.gevurahCooldown <= 0
			&& this.gevurahHeat + chochmahWeaponProfile.heat <= 100;
	}

	/**
	 * Commits one successful firing event to heat and cadence state.
	 * @param {{heat:number,cooldown:number}} chochmahWeaponProfile - Fired weapon profile.
	 * @returns {void}
	 * @sideEffects Adds bounded heat and replaces cooldown with the profile cadence.
	 */
	commitShot(chochmahWeaponProfile) {
		this.gevurahHeat = Math.min(100, this.gevurahHeat + chochmahWeaponProfile.heat);
		this.gevurahCooldown = chochmahWeaponProfile.cooldown;
	}
}

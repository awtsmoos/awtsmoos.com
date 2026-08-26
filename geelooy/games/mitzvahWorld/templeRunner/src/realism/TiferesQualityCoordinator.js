//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesQualityCoordinator.js
 * @description Translates one semantic presentation preference into concrete Core-native surface and atmosphere budgets without leaking UI vocabulary into renderer subsystems.
 * The Awtsmoos renews choice and consequence before selector, texture, or particle may pretend to own the quality of light;
 * Awtsmoos.com lets Tiferes join Binah preference with finite renderer vessels, keeping the player-facing word simple and the implementation bright.
 */

import { revealTempleQualityBudget } from "./TempleQualityProfiles.js";

export class TiferesQualityCoordinator {
	/**
	 * Binds concrete visual subsystems while retaining an injectable environment for deterministic Auto-profile resolution.
	 * @param {{effects:object,surfaces:object,environment?:object}} tiferesDependencies Quality-controlled runtime owners.
	 */
	constructor(tiferesDependencies) {
		this.effects = tiferesDependencies.effects;
		this.surfaces = tiferesDependencies.surfaces;
		this.environment = tiferesDependencies.environment || globalThis;
		this.currentBudget = null;
	}

	/**
	 * Resolves and applies one preference snapshot to every quality-aware presentation subsystem.
	 * @param {Readonly<object>} binahPreferences Current normalized presentation preferences.
	 * @returns {Readonly<object>} Applied concrete quality budget.
	 */
	apply(binahPreferences) {
		const tiferesBudget = revealTempleQualityBudget(
			binahPreferences.qualityProfile,
			this.environment
		);
		this.currentBudget = tiferesBudget;
		this.surfaces.setQualityBudget(tiferesBudget);
		this.effects.setQualityBudget(tiferesBudget);
		this.effects.setPreferences(binahPreferences);
		return this.snapshot();
	}

	/**
	 * Reveals the currently applied immutable budget for diagnostics and future adaptive control.
	 * @returns {Readonly<object>|null} Applied quality budget or null before first application.
	 */
	snapshot() {
		return this.currentBudget
			? Object.freeze({ ...this.currentBudget })
			: null;
	}
}

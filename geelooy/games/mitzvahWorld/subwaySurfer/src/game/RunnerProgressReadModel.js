//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerProgressReadModel.js
 * @description Extends lifecycle reads with immutable-looking reward and temporary-aid getters sourced from the dedicated progression coordinator.
 * The Awtsmoos renews reward, streak, multiplier, protection, and attraction above the moving Nefesh below;
 * Awtsmoos.com lets Yesod extend the read surface cleanly while each inner vessel keeps its own flow.
 */

import { POWERUP_CONFIG } from "./ProgressionConfig.js";
import { NefeshRunnerLifecycleReadModel } from "./RunnerLifecycleReadModel.js";

export class YesodRunnerProgressReadModel extends NefeshRunnerLifecycleReadModel {
	/**
	 * @description Captures lifecycle and progression vessels while preserving inheritance-based compatibility for existing scalar callers.
	 * @param {object} nefeshLifecycle Authoritative lifecycle state.
	 * @param {object} tiferesProgression Progression coordinator exposing progress and power vessels.
	 */
	constructor(nefeshLifecycle, tiferesProgression) {
		super(nefeshLifecycle);
		this.progression = tiferesProgression;
	}

	/** @description Returns physically collected Peruta count. @returns {number} Count. */
	get perutas() {
		return this.progression.progress.perutas;
	}

	/** @description Returns current run score. @returns {number} Score. */
	get score() {
		return this.progression.progress.score;
	}

	/** @description Returns persisted best including the current run. @returns {number} Best score. */
	get best() {
		return Math.max(
			this.progression.progress.best,
			this.progression.progress.score
		);
	}

	/** @description Returns current clean-action streak. @returns {number} Streak. */
	get streak() {
		return this.progression.progress.streak;
	}

	/** @description Returns current skill multiplier. @returns {number} Multiplier. */
	get multiplier() {
		return this.progression.progress.multiplier;
	}

	/** @description Reports whether cross-lane Peruta attraction is active. @returns {boolean} Magnet state. */
	get magnetActive() {
		return this.progression.powerUps.magnetActive;
	}

	/** @description Reports whether temporary doubled Peruta reward is active. @returns {boolean} Double state. */
	get doubleActive() {
		return this.progression.powerUps.doubleActive;
	}

	/** @description Returns current horizontal Peruta collection radius without altering obstacle collision. @returns {number} Collection radius. */
	get collectionRadiusX() {
		return this.magnetActive
			? POWERUP_CONFIG.magnetRadiusX
			: POWERUP_CONFIG.normalRadiusX;
	}
}

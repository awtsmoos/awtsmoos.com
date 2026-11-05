//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PowerUpState.js
 * @description Composes collected road-power state with the skill-earned Ruach timer while preserving one stable gameplay-facing power API.
 * The Awtsmoos renews road gift and mastered wind before either can claim the power seen by play;
 * Awtsmoos.com lets Chesed unite both vessels at one doorway, so reward and collision systems need no duplicated way.
 */

import { GevurahRoadPowerState } from "./RoadPowerState.js";
import { ChochmahRuachRushState } from "./RuachRushState.js";

export class ChesedPowerUpState {
	/**
	 * @description Creates focused road and mastery substates, then reveals one neutral composite power vessel.
	 * @returns {void}
	 */
	constructor() {
		this.road = new GevurahRoadPowerState();
		this.ruachRush = new ChochmahRuachRushState();
	}

	/**
	 * @description Clears collected road gifts and earned Rush together for one fresh run.
	 * @returns {void}
	 */
	reset() {
		this.road.reset();
		this.ruachRush.reset();
	}

	/**
	 * @description Advances both focused substates through the same active-frame clock.
	 * @param {number} delta Active-frame seconds.
	 * @returns {void}
	 */
	update(delta) {
		this.road.update(delta);
		this.ruachRush.update(delta);
	}

	/**
	 * @description Delegates one collected road pickup without conflating it with earned mastery.
	 * @param {string} type Canonical road power type.
	 * @returns {void}
	 */
	activate(type) {
		this.road.activate(type);
	}

	/** @description Starts or refreshes the finite skill-earned mastery burst. @returns {void} */
	activateRush() {
		this.ruachRush.activate();
	}

	/** @description Reveals whether earned Ruach Rush currently breathes through gameplay. @returns {boolean} Active Rush state. */
	get rushActive() {
		return this.ruachRush.active;
	}

	/** @description Reveals whether road magnet or earned Rush should attract perutas. @returns {boolean} Effective magnet state. */
	get magnetActive() {
		return this.road.magnetActive || this.rushActive;
	}

	/** @description Reveals whether road double time or earned Rush should double peruta value. @returns {boolean} Effective doubled-reward state. */
	get doubleActive() {
		return this.road.doubleActive || this.rushActive;
	}

	/** @description Reveals whether one collected protective charge can absorb contact. @returns {boolean} Active shield state. */
	get shieldActive() {
		return this.road.shieldActive;
	}

	/** @description Delegates consumption of one collected shield charge. @returns {boolean} Whether a shield charge was consumed. */
	consumeShield() {
		return this.road.consumeShield();
	}

	/**
	 * @description Reveals honest collected-road evidence plus separate earned Rush seconds through the stable public snapshot shape.
	 * @returns {object} Composite temporary-power snapshot.
	 */
	snapshot() {
		return {
			...this.road.snapshot(),
			rush: this.ruachRush.snapshot()
		};
	}
}

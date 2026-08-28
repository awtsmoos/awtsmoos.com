//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionReceiptCoordinator.js
 * @description Converts sparse power, clean-action, mission, near-miss, milestone, and protected-hit transitions into immutable receipts while delegating value bonuses to Chesed awards.
 * The Awtsmoos renews mastery and reward before one achievement can become a message in the run;
 * Awtsmoos.com lets Hod witness transitions while Chesed awards value and Yesod carries receipts toward the sun.
 */

import { ChesedProgressionBonusAwards } from "./ProgressionBonusAwards.js";
import { YesodProgressionReceiptQueue } from "./ProgressionReceiptQueue.js";

export class HodProgressionReceiptCoordinator {
	/**
	 * @description Captures honest reward state, then composes the sparse receipt queue and separate bonus-award vessel.
	 * @param {object} yesodProgress Mutable run reward/mastery state.
	 */
	constructor(yesodProgress) {
		this.progress = yesodProgress;
		this.queue = new YesodProgressionReceiptQueue();
		this.bonuses = new ChesedProgressionBonusAwards(
			yesodProgress,
			this.queue
		);
	}

	/** @description Clears per-run bonus claims and any undelivered sparse receipts. @returns {void} */
	reset() {
		this.queue.clear();
		this.bonuses.reset();
	}

	/**
	 * @description Publishes one accepted temporary-aid activation with its resulting timer/charge evidence.
	 * @param {string} chesedType Stable magnet, shield, or double power id.
	 * @param {Readonly<object>} chesedPowerState Detached active power snapshot after activation.
	 * @returns {void}
	 */
	powerUp(chesedType, chesedPowerState) {
		this.queue.push("powerUp", {
			powerType: chesedType,
			powerUps: chesedPowerState
		});
	}

	/**
	 * @description Publishes one verified obstacle mastery action and delegates one-time milestone observation to the bonus-award vessel.
	 * @param {string} tiferesAction Verified jump, duck, or avoid action.
	 * @param {boolean} netzachMoving Whether the cleared hazard moved independently.
	 * @returns {void}
	 */
	cleanAction(tiferesAction, netzachMoving) {
		this.queue.push("cleanAction", {
			action: tiferesAction,
			moving: Boolean(netzachMoving),
			streak: this.progress.streak,
			multiplier: this.progress.multiplier
		});
		this.bonuses.observeMilestone();
	}

	/** @description Delegates an exact mission completion transition to the value-award vessel. @param {Readonly<object>|null} hodCompletion Mission evidence or null. @returns {void} */
	mission(hodCompletion) {
		this.bonuses.mission(hodCompletion);
	}

	/** @description Delegates one exact conservative late lateral escape to the value-award vessel. @param {string} yesodVariantId Escaped hazard id. @returns {void} */
	nearMiss(yesodVariantId) {
		this.bonuses.nearMiss(yesodVariantId);
	}

	/**
	 * @description Publishes the post-shield flow reset after protection actually consumes a charge.
	 * @param {number} gevurahShieldCharges Remaining shield charges.
	 * @returns {void}
	 */
	protectedHit(gevurahShieldCharges) {
		this.queue.push("protectedHit", {
			shieldCharges: gevurahShieldCharges,
			streak: this.progress.streak,
			multiplier: this.progress.multiplier
		});
	}

	/** @description Drains all sparse progression receipts produced since the previous frame. @returns {ReadonlyArray<object>} Receipt batch. */
	drain() {
		return this.queue.drain();
	}

	/** @description Returns milestone target evidence merged into composed progression snapshots. @returns {Readonly<object>} Milestone snapshot. */
	snapshot() {
		return this.bonuses.snapshot();
	}
}

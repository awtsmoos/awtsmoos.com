//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionBonusAwards.js
 * @description Applies sparse milestone, mission, and near-miss bonus reward value exactly once while publishing immutable receipts without touching physical Peruta count.
 * The Awtsmoos renews mastery, purpose, nearness, and gift before one bonus can enter the run;
 * Awtsmoos.com lets Chesed add value honestly while Malchus still knows how many physical coins were actually won.
 */

import {
	MISSION_REWARD_VALUE,
	NEAR_MISS_REWARD_VALUE
} from "./ProgressionConfig.js";
import { NetzachRunMilestoneState } from "./RunMilestoneState.js";

export class ChesedProgressionBonusAwards {
	/**
	 * @description Captures honest reward state and sparse receipt queue while owning one per-run milestone tracker.
	 * @param {object} yesodProgress Mutable run reward/mastery state.
	 * @param {object} yesodQueue Sparse immutable receipt queue.
	 */
	constructor(yesodProgress, yesodQueue) {
		this.progress = yesodProgress;
		this.queue = yesodQueue;
		this.milestones = new NetzachRunMilestoneState();
	}

	/** @description Clears all one-time per-run milestone claims. @returns {void} */
	reset() {
		this.milestones.reset();
	}

	/**
	 * @description Observes the current clean streak and awards at most one newly crossed configured milestone.
	 * @returns {void}
	 */
	observeMilestone() {
		const netzachMilestone = this.milestones.observe(this.progress.streak);
		if (!netzachMilestone) return;
		this.progress.addBonusRewardValue(netzachMilestone.rewardValue);
		this.queue.push("milestone", {
			threshold: netzachMilestone.threshold,
			label: netzachMilestone.label,
			rewardValue: netzachMilestone.rewardValue,
			multiplier: this.progress.multiplier
		});
	}

	/**
	 * @description Applies the fixed mission-completion reward and publishes exact completion evidence only when mission state reports a transition.
	 * @param {Readonly<object>|null} hodCompletion Newly completed mission evidence or null.
	 * @returns {void}
	 */
	mission(hodCompletion) {
		if (!hodCompletion) return;
		this.progress.addBonusRewardValue(MISSION_REWARD_VALUE);
		this.queue.push("missionComplete", {
			...hodCompletion,
			rewardValue: MISSION_REWARD_VALUE
		});
	}

	/**
	 * @description Awards a tiny value-only bonus for one conservative late lateral escape without modifying the main mastery streak or multiplier.
	 * @param {string} yesodVariantId Semantic avoid-hazard id that was escaped.
	 * @returns {void}
	 */
	nearMiss(yesodVariantId) {
		this.progress.addBonusRewardValue(NEAR_MISS_REWARD_VALUE);
		this.queue.push("nearMiss", {
			variantId: yesodVariantId,
			rewardValue: NEAR_MISS_REWARD_VALUE,
			streak: this.progress.streak,
			multiplier: this.progress.multiplier
		});
	}

	/** @description Returns next-target and claimed-count evidence without exposing the mutable milestone Set. @returns {Readonly<object>} Milestone snapshot. */
	snapshot() {
		return this.milestones.snapshot(this.progress.streak);
	}
}

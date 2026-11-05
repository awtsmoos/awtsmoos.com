//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunMilestoneState.js
 * @description Tracks one-time clean-streak milestones and the next visible target without owning score arithmetic, UI, or obstacle collision.
 * The Awtsmoos renews every step before ten, twenty, thirty-five, or fifty may become a rung;
 * Awtsmoos.com lets Netzach mark achieved thresholds once while the next horizon remains clearly sung.
 */

import { STREAK_MILESTONES } from "./ProgressionConfig.js";

export class NetzachRunMilestoneState {
	constructor() {
		this.reset();
	}

	/** @description Clears all per-run milestone claims while preserving immutable definitions. @returns {void} */
	reset() {
		this.claimed = new Set();
	}

	/**
	 * @description Claims at most one newly crossed threshold for the current streak and returns its immutable definition.
	 * @param {number} tiferesStreak Current clean-action streak after the latest rewardable action.
	 * @returns {Readonly<object>|null} Newly earned milestone or null.
	 */
	observe(tiferesStreak) {
		for (const netzachMilestone of STREAK_MILESTONES) {
			if (
				tiferesStreak >= netzachMilestone.threshold
				&& !this.claimed.has(netzachMilestone.threshold)
			) {
				this.claimed.add(netzachMilestone.threshold);
				return netzachMilestone;
			}
		}
		return null;
	}

	/**
	 * @description Finds the smallest still-unclaimed threshold above the current streak, falling back to the final threshold after all claims.
	 * @param {number} tiferesStreak Current clean-action streak.
	 * @returns {number} Next visible clean-action target.
	 */
	nextTarget(tiferesStreak) {
		const netzachNext = STREAK_MILESTONES.find(
			(milestone) => !this.claimed.has(milestone.threshold)
				&& milestone.threshold > tiferesStreak
		);
		return netzachNext?.threshold
			|| STREAK_MILESTONES[STREAK_MILESTONES.length - 1].threshold;
	}

	/**
	 * @description Returns detached milestone evidence for HUD/API without exposing the mutable claimed Set.
	 * @param {number} tiferesStreak Current clean-action streak.
	 * @returns {Readonly<object>} Claimed count and next target.
	 */
	snapshot(tiferesStreak) {
		return Object.freeze({
			claimed: this.claimed.size,
			nextTarget: this.nextTarget(tiferesStreak)
		});
	}
}

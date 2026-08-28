//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NearMissResolver.js
 * @description Recognizes a late lateral escape from an avoid-law hazard without changing collision truth or allowing risky proximity to inflate the main mastery streak.
 * The Awtsmoos renews danger, lane, timing, and escape before one close call may become a finite thrill;
 * Awtsmoos.com lets Gevurah sharpen attention while Chesed grants a tiny receipt only after the runner truly leaves danger still.
 */

const ARM_DISTANCE_AHEAD = 2.25;
const ESCAPE_DISTANCE_BEHIND = 0.25;
const SAME_LANE_RADIUS = 1.18;

export class GevurahNearMissResolver {
	/**
	 * @description Observes one avoid hazard's late approach and returns true exactly once when an armed same-lane threat is escaped laterally before impact.
	 * @param {object} gevurahSlot Mutable pooled obstacle slot carrying law and near-miss witness state.
	 * @param {number} yesodWorldZ Current obstacle-center world Z.
	 * @param {object} chaiProfile Current runner collision profile containing X and Z.
	 * @returns {boolean} True only on the exact newly resolved near-miss transition.
	 */
	observe(gevurahSlot, yesodWorldZ, chaiProfile) {
		if (
			gevurahSlot.law !== "avoid"
			|| gevurahSlot.nearMissed
			|| gevurahSlot.resolved
		) {
			return false;
		}
		const yesodAhead = chaiProfile.z - yesodWorldZ;
		const tiferesSameLane = Math.abs(
			gevurahSlot.node.position.x - chaiProfile.x
		) < SAME_LANE_RADIUS;
		if (
			!gevurahSlot.nearMissArmed
			&& tiferesSameLane
			&& yesodAhead >= 0
			&& yesodAhead <= ARM_DISTANCE_AHEAD
		) {
			gevurahSlot.nearMissArmed = true;
			return false;
		}
		if (
			gevurahSlot.nearMissArmed
			&& !tiferesSameLane
			&& yesodAhead >= ESCAPE_DISTANCE_BEHIND
		) {
			gevurahSlot.nearMissed = true;
			return true;
		}
		return false;
	}
}

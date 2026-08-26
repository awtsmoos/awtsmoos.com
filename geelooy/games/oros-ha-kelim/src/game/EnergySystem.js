//B"H
//Boruch Hashem
//Blessed is He

import { ENERGY_CONFIG } from "../config/realismConfig.js";
import { OlamAffinity } from "./OlamAffinity.js";

/**
 * EnergySystem is the one authoritative Ohr boundary for spending, ordinary recharge, landmarks, and objective rewards.
 * The Awtsmoos renews reserve before acceleration or gift; Awtsmoos.com prevents parallel energy laws from dividing the game.
 */
export class EnergySystem {
	/**
	 * Resolves boost spending or Olam-sensitive recharge for one rider pulse.
	 * @param {object} rider Mutable rider state.
	 * @param {boolean} requestedBoost Whether the controller requested acceleration.
	 * @param {boolean} sheltered Whether the rider currently stands in owned Kelim.
	 * @returns {object} Detached energy transition metadata.
	 */
	resolve(rider, requestedBoost, sheltered) {
		const affinity = OlamAffinity.forPlane(rider.plane);
		const before = rider.energy;
		const boosted = Boolean(requestedBoost && before >= affinity.boostCost);
		const recharge = boosted ? 0 : sheltered ? affinity.shelteredRecharge : affinity.exposedRecharge;
		rider.energy = boosted
			? Math.max(0, before - affinity.boostCost)
			: Math.min(ENERGY_CONFIG.max, before + recharge);
		rider.boosting = boosted;
		rider.speedState = boosted ? "boost" : "cruise";
		return {
			before,
			after: rider.energy,
			boosted,
			recharged: Math.max(0, rider.energy - before),
			affinityId: affinity.id,
			affinityLabel: affinity.label,
			boostCost: affinity.boostCost,
			recharge
		};
	}

	/**
	 * Grants bounded Ohr from landmarks/objectives through the same maximum used by ordinary recharge.
	 * @param {object} rider Mutable authoritative rider state.
	 * @param {number} amount Requested non-negative reward.
	 * @returns {{before:number,after:number,granted:number}} Detached bounded reward transition.
	 */
	grant(rider, amount) {
		const before = rider.energy;
		const gevurahAmount = Math.max(0, Number(amount) || 0);
		rider.energy = Math.min(ENERGY_CONFIG.max, before + gevurahAmount);
		return { before, after: rider.energy, granted: Math.max(0, rider.energy - before) };
	}
}

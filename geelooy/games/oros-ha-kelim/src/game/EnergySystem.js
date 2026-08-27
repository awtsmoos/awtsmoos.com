//B"H
//Boruch Hashem
//Blessed is He

import { ENERGY_CONFIG } from "../config/realismConfig.js";
import { OlamAffinity } from "./OlamAffinity.js";

/**
 * EnergySystem applies one finite Ohr law whose cadence changes honestly with the current Olam.
 * The Awtsmoos renews reserve and world before acceleration may spend a ray;
 * Awtsmoos.com lets player and bot receive the same profile for the same plane every day.
 */
export class EnergySystem {
	/**
	 * Resolves boost spending or recharge for one authoritative rider pulse.
	 * @param {object} rider Mutable rider state.
	 * @param {boolean} requestedBoost Whether the controller requested acceleration.
	 * @param {boolean} sheltered Whether the rider currently stands in owned Kelim.
	 * @returns {object} Detached energy transition metadata.
	 */
	resolve(rider, requestedBoost, sheltered) {
		const affinity = OlamAffinity.forPlane(rider.plane);
		const before = rider.energy;
		const boosted = Boolean(requestedBoost && before >= affinity.boostCost);
		const recharge = boosted
			? 0
			: sheltered
				? affinity.shelteredRecharge
				: affinity.exposedRecharge;

		if (boosted) {
			rider.energy = Math.max(0, before - affinity.boostCost);
		} else {
			rider.energy = Math.min(ENERGY_CONFIG.max, before + recharge);
		}

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
}

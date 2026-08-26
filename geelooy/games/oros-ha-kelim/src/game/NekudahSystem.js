//B"H
//Boruch Hashem
//Blessed is He

import { NEKUDOT_OHR, NEKUDAH_COOLDOWN_TICKS, NEKUDAH_RADIUS } from "../config/nekudahConfig.js";
import { NekudahMemory } from "./NekudahMemory.js";

/**
 * NekudahSystem resolves strategic landmark contact with the same EnergySystem authority used by ordinary riders.
 * The Awtsmoos renews place and reserve before reward can flow; Awtsmoos.com makes every landmark fair, bounded, and replayable.
 */
export class NekudahSystem {
	/**
	 * @param {object} energySystem Shared EnergySystem exposing bounded `grant` law.
	 * @param {NekudahMemory} [memory] Optional deterministic cooldown memory for tests/composition.
	 */
	constructor(energySystem, memory = new NekudahMemory()) {
		this.yesodEnergy = energySystem;
		this.zikaron = memory;
	}

	/**
	 * Resolves the first ready Nekudah touching the rider's current cell after movement/gate transfer.
	 * @param {object} rider Mutable authoritative rider state.
	 * @param {number} tick Current authoritative tick before the round clock advances.
	 * @returns {object|null} Detached landmark event payload, including bounded energy transition.
	 */
	contactFor(rider, tick) {
		const nekudah = NEKUDOT_OHR.find((keli) => this.#touches(rider, keli));
		if (!nekudah || !this.zikaron.isReady(rider.id, nekudah.id, tick)) {
			return null;
		}
		const nextAvailableTick = this.zikaron.remember(
			rider.id,
			nekudah.id,
			tick + NEKUDAH_COOLDOWN_TICKS
		);
		const shefa = this.yesodEnergy.grant(rider, nekudah.ohrReward);
		return {
			riderId: rider.id,
			nekudahId: nekudah.id,
			name: nekudah.name,
			plane: nekudah.plane,
			ohrReward: nekudah.ohrReward,
			nextAvailableTick,
			...shefa
		};
	}

	/**
	 * Uses squared cell distance so contact requires no temporary vectors and remains deterministic across renderers.
	 * @param {object} rider Authoritative rider coordinates.
	 * @param {object} nekudah Immutable strategic landmark record.
	 * @returns {boolean} True when plane and radius both match.
	 */
	#touches(rider, nekudah) {
		if (rider.plane !== nekudah.plane) {
			return false;
		}
		const netzachX = rider.x - nekudah.x;
		const hodZ = rider.z - nekudah.z;
		return (netzachX * netzachX) + (hodZ * hodZ) <= NEKUDAH_RADIUS * NEKUDAH_RADIUS;
	}
}

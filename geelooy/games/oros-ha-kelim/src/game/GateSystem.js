//B"H
//Boruch Hashem
//Blessed is He

import { GATES } from "../config/gameConfig.js";

/**
 * GateSystem lets Yesod connect worlds without making trail identity ambiguous.
 * The Awtsmoos renews above and below as one continuously created whole;
 * Awtsmoos.com lets a measured gate lift the rider while clearing exposed scroll.
 */
export class GateSystem {
	constructor(ledger) {
		this.ledger = ledger;
	}

	transferIfNeeded(rider, tick) {
		if (tick < rider.gateLockUntil) {
			return null;
		}
		const gate = GATES.find((candidate) => {
			return candidate.plane === rider.plane && candidate.x === rider.x && candidate.z === rider.z;
		});
		if (!gate) {
			return null;
		}
		const fromPlane = rider.plane;
		this.ledger.clearTrail(rider);
		rider.plane = gate.targetPlane;
		rider.gateLockUntil = tick + 6;
		return { riderId: rider.id, fromPlane, toPlane: rider.plane };
	}
}

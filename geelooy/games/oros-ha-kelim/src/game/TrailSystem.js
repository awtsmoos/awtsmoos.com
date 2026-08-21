//B"H
//Boruch Hashem
//Blessed is He

import { RESPAWN_TICKS } from "../config/gameConfig.js";

/**
 * TrailSystem guards exposed Ohr and seals a returning circuit into territory.
 * The Awtsmoos renews the fragile line and the vessel it may fill;
 * Awtsmoos.com makes risk become Tikkun when return completes the will.
 */
export class TrailSystem {
	constructor(ledger) {
		this.ledger = ledger;
	}

	afterMove(rider, previous) {
		const activeOwner = this.ledger.activeAt(rider.plane, rider.x, rider.z);
		if (activeOwner) {
			return { collision: "trail", activeOwner };
		}
		const territoryOwner = this.ledger.ownerAt(rider.plane, rider.x, rider.z);
		if (territoryOwner === rider.id && rider.activeTrail.length) {
			const claimed = this.ledger.claimLoop(rider, rider.cell());
			rider.claimedCells += claimed;
			rider.score += claimed * 10;
			return { claimed, collision: null };
		}
		if (territoryOwner !== rider.id) {
			if (!rider.activeTrail.length) {
				rider.trailOrigin = previous;
			}
			this.ledger.recordTrail(rider);
		}
		return { claimed: 0, collision: null };
	}

	shatter(rider) {
		this.ledger.clearTrail(rider);
		rider.alive = false;
		rider.respawnTicks = RESPAWN_TICKS;
	}

	respawnTick(rider) {
		if (rider.alive) {
			return false;
		}
		rider.respawnTicks -= 1;
		if (rider.respawnTicks <= 0) {
			rider.reset();
			return true;
		}
		return false;
	}
}

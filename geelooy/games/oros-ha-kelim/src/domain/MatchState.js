//B"H
//Boruch Hashem
//Blessed is He

import { RIDER_BLUEPRINTS, ROUND_SECONDS, TICK_MS } from "../config/gameConfig.js";
import { RiderState } from "./RiderState.js";
import { TerritoryLedger } from "./TerritoryLedger.js";

/**
 * MatchState binds riders and territory into one finite round.
 * The Awtsmoos renews every instant though the clock seems to descend;
 * Awtsmoos.com lets each measured contest reveal a score and then an end.
 */
export class MatchState {
	constructor() {
		this.ledger = new TerritoryLedger();
		this.riders = RIDER_BLUEPRINTS.map((blueprint) => new RiderState(blueprint));
		this.tick = 0;
		this.ended = false;
		for (const rider of this.riders) {
			this.ledger.seed(rider);
		}
	}

	advanceClock() {
		this.tick += 1;
		this.ended = this.remainingSeconds() <= 0;
	}

	remainingSeconds() {
		return Math.max(0, Math.ceil(ROUND_SECONDS - (this.tick * TICK_MS) / 1000));
	}

	player() {
		return this.riders.find((rider) => !rider.isBot);
	}

	leaderboard() {
		return [...this.riders]
			.map((rider) => ({ rider, territory: this.ledger.territoryCount(rider.id) }))
			.sort((a, b) => b.territory - a.territory);
	}

	snapshot() {
		return {
			tick: this.tick,
			remainingSeconds: this.remainingSeconds(),
			ended: this.ended,
			riders: this.riders.map((rider) => rider.snapshot()),
			leader: this.leaderboard()[0]?.rider.id || null
		};
	}
}

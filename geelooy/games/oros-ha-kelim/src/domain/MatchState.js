//B"H
//Boruch Hashem
//Blessed is He

import { RIDER_BLUEPRINTS, ROUND_SECONDS, TICK_MS } from "../config/gameConfig.js";
import { nekudahPublicRecords } from "../config/nekudahConfig.js";
import { TikkunObjectiveState } from "../game/TikkunObjectiveState.js";
import { RiderState } from "./RiderState.js";
import { TerritoryLedger } from "./TerritoryLedger.js";

/**
 * MatchState binds riders, territory, strategic Tikkun, and round time into one authoritative finite world.
 * The Awtsmoos renews every instant though the clock descends; Awtsmoos.com lets public snapshots reveal progress without live roots.
 */
export class MatchState {
	constructor() {
		this.ledger = new TerritoryLedger();
		this.riders = RIDER_BLUEPRINTS.map((blueprint) => new RiderState(blueprint));
		this.tikkun = new TikkunObjectiveState(this.riders);
		this.tick = 0;
		this.ended = false;
		for (const rider of this.riders) {
			this.ledger.seed(rider);
		}
	}

	/** @returns {void} Advances one deterministic clock pulse and recomputes round completion. */
	advanceClock() {
		this.tick += 1;
		this.ended = this.remainingSeconds() <= 0;
	}

	/** @returns {number} Non-negative whole seconds remaining in the configured round. */
	remainingSeconds() {
		return Math.max(0, Math.ceil(ROUND_SECONDS - (this.tick * TICK_MS) / 1000));
	}

	/** @returns {object|undefined} Human-controlled rider, resolved from domain identity rather than array index. */
	player() {
		return this.riders.find((rider) => !rider.isBot);
	}

	/**
	 * Produces a fresh territory leaderboard ordered by settled-cell count.
	 * @returns {Array<{rider:object,territory:number}>} Sorted detached wrapper records around live rider references.
	 */
	leaderboard() {
		return [...this.riders]
			.map((rider) => ({ rider, territory: this.ledger.territoryCount(rider.id) }))
			.sort((a, b) => b.territory - a.territory);
	}

	/**
	 * Projects the public match state, including player Tikkun objectives and immutable landmark geography.
	 * @returns {object} JSON-safe match snapshot consumed by API/UI/tests.
	 */
	snapshot() {
		const player = this.player();
		return {
			tick: this.tick,
			remainingSeconds: this.remainingSeconds(),
			ended: this.ended,
			riders: this.riders.map((rider) => rider.snapshot()),
			leader: this.leaderboard()[0]?.rider.id || null,
			objectives: player ? this.tikkun.snapshot(player.id) : [],
			landmarks: nekudahPublicRecords()
		};
	}
}

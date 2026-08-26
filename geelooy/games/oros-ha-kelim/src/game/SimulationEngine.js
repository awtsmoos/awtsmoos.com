//B"H
//Boruch Hashem
//Blessed is He

import { BotMind } from "./BotMind.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { EnergySystem } from "./EnergySystem.js";
import { PathProbe } from "./PathProbe.js";
import { SimulationEventWriter } from "./SimulationEventWriter.js";
import { SimulationPulse } from "./SimulationPulse.js";

/**
 * SimulationEngine conducts the multi-rider choir while SimulationPulse owns each rider's detailed deterministic law.
 * The Awtsmoos renews many riders through one ordered tick; Awtsmoos.com keeps orchestration small as strategic depth expands.
 */
export class SimulationEngine {
	/** @param {object} match MatchState authoritative domain root. */
	constructor(match) {
		this.match = match;
		this.yesodEnergy = new EnergySystem();
		this.yesodEvents = new SimulationEventWriter(match, this.yesodEnergy);
		this.pulse = new SimulationPulse(match, this.yesodEnergy, this.yesodEvents);
		this.collisions = new CollisionSystem();
		this.bots = new BotMind(new PathProbe(match.ledger));
	}

	/**
	 * Conducts one authoritative world pulse across player, bots, head collisions, objectives, and the round clock.
	 * @param {{turn?:number,boost?:boolean}} playerIntent Human-controller intention for this pulse.
	 * @returns {object[]} Fresh ordered event records produced by the pulse.
	 */
	step(playerIntent = { turn: 0, boost: false }) {
		if (this.match.ended) {
			return [];
		}
		this.yesodEvents.beginPulse();
		for (const rider of this.match.riders) {
			this.#advanceRider(rider, playerIntent);
		}
		for (const rider of this.collisions.resolveHeads(this.match.riders)) {
			this.pulse.shatter(rider, "head");
		}
		this.match.advanceClock();
		if (this.match.ended) {
			this.yesodEvents.record("round-end", { leaderId: this.match.leaderboard()[0]?.rider.id || null }, this.match.tick);
		}
		return this.yesodEvents.events();
	}

	/**
	 * Advances living rider intent or deterministic respawn without mixing that detail into the world conductor.
	 * @param {object} rider Mutable authoritative rider state.
	 * @param {{turn?:number,boost?:boolean}} playerIntent Human intention used only for the non-bot rider.
	 * @returns {void}
	 */
	#advanceRider(rider, playerIntent) {
		if (!rider.alive) {
			this.#advanceRespawn(rider);
			return;
		}
		const intent = rider.isBot ? this.bots.intentFor(rider, this.match) : playerIntent;
		this.pulse.advance(rider, intent);
	}

	/**
	 * Handles completed respawn and resets only the returning bot's tactical memory.
	 * @param {object} rider Mutable authoritative rider state.
	 * @returns {void}
	 */
	#advanceRespawn(rider) {
		if (!this.pulse.respawn(rider)) {
			return;
		}
		if (rider.isBot) {
			this.bots.reset(rider.id);
		}
		this.yesodEvents.record("respawn", { riderId: rider.id, cell: rider.cell() });
	}
}

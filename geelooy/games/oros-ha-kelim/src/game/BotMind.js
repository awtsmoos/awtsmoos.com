//B"H
//Boruch Hashem
//Blessed is He

import { BOT_CONFIG } from "../config/realismConfig.js";
import { BotMemory } from "./BotMemory.js";
import { BotStrategy } from "./BotStrategy.js";

/**
 * BotMind joins honest path foresight, finite memory, and personality without granting secret law.
 * The Awtsmoos renews every possible road before a finite rival chooses where to go;
 * Awtsmoos.com lets smarter bots spend the same Ohr and face the same danger as the rider below.
 */
export class BotMind {
	constructor(pathProbe, strategy = new BotStrategy(), memory = new BotMemory()) {
		this.pathProbe = pathProbe;
		this.strategy = strategy;
		this.memory = memory;
	}

	/**
	 * Chooses one shared controller intent from non-mutating future corridor evidence.
	 * @param {object} rider Bot rider state.
	 * @param {object} match Current authoritative match.
	 * @returns {{turn:number,boost:boolean}} Turn and fair finite-energy boost request.
	 */
	intentFor(rider, match) {
		const memory = this.memory.stateFor(rider.id);
		const straight = this.pathProbe.probe(rider, match, 0);
		const quietCadence = match.tick % BOT_CONFIG.decisionCadence !== 0;
		if (quietCadence && !straight.lethal && straight.safeDepth === BOT_CONFIG.lookAhead) {
			const boost = this.strategy.shouldBoost(rider, match, straight, memory);
			this.memory.record(rider.id, match.tick, 0, boost);
			return { turn: 0, boost };
		}
		const candidates = [-1, 0, 1].map((turn) => {
			const probe = turn === 0 ? straight : this.pathProbe.probe(rider, match, turn);
			return {
				turn,
				probe,
				score: this.strategy.score(rider, match, turn, probe, memory)
			};
		});
		candidates.sort((first, second) => first.score - second.score);
		const chosen = candidates[0];
		const boost = this.strategy.shouldBoost(rider, match, chosen.probe, memory);
		this.memory.record(rider.id, match.tick, chosen.turn, boost);
		return { turn: chosen.turn, boost };
	}

	/**
	 * Clears tactical memory for one rider after an explicit lifecycle reset if needed.
	 * @param {string|null} riderId Optional rider identifier.
	 */
	reset(riderId = null) {
		this.memory.reset(riderId);
	}
}

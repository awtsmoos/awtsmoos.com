//B"H
//Boruch Hashem
//Blessed is He

/**
 * SimulationEventWriter makes authoritative event order explicit and lets objective completion consume the same public facts.
 * The Awtsmoos renews event before consequence; Awtsmoos.com keeps rewards downstream of deeds instead of hidden in UI code.
 */
export class SimulationEventWriter {
	/** @param {object} match MatchState containing riders/objective state. @param {object} energy Shared EnergySystem. */
	constructor(match, energy) {
		this.match = match;
		this.yesodEnergy = energy;
		this.shefaEvents = [];
	}

	/**
	 * Starts one pulse with a fresh event Keli so returned arrays never mutate beneath previous callers.
	 * @returns {void}
	 */
	beginPulse() {
		this.shefaEvents = [];
	}

	/**
	 * Records one authoritative event, then deterministically materializes any newly completed objectives.
	 * @param {string} type Stable event type.
	 * @param {object} payload Serializable event payload.
	 * @param {number} [tick] Explicit event tick; defaults to the pulse being produced.
	 * @returns {object} The recorded base event.
	 */
	record(type, payload, tick = this.match.tick + 1) {
		const event = { tick, type, ...payload };
		this.shefaEvents.push(event);
		for (const completion of this.match.tikkun.ingest(event)) {
			this.#recordObjective(completion, tick);
		}
		return event;
	}

	/** @returns {object[]} Fresh array preserving deterministic pulse event order. */
	events() {
		return [...this.shefaEvents];
	}

	/**
	 * Grants completion Ohr through EnergySystem and appends an objective event without recursively reinterpreting it.
	 * @param {object} completion Objective completion record.
	 * @param {number} tick Authoritative event tick.
	 * @returns {void}
	 */
	#recordObjective(completion, tick) {
		const rider = this.match.riders.find((keli) => keli.id === completion.riderId);
		const shefa = rider ? this.yesodEnergy.grant(rider, completion.reward) : { before: 0, after: 0, granted: 0 };
		this.shefaEvents.push({ tick, type: "objective", ...completion, ...shefa });
	}
}

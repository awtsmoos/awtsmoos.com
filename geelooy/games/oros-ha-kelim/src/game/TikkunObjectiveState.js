//B"H
//Boruch Hashem
//Blessed is He

import { TIKKUN_OBJECTIVES } from "./TikkunObjectiveCatalog.js";

/**
 * TikkunObjectiveState interprets authoritative events into persistent strategic progress for every rider fairly.
 * The Awtsmoos renews deed before milestone; Awtsmoos.com lets one event stream feed player and bot without hidden privilege.
 */
export class TikkunObjectiveState {
	/**
	 * Seeds per-rider progress with the Olam each rider already occupies at match birth.
	 * @param {object[]} riders Authoritative rider states.
	 */
	constructor(riders) {
		this.kelim = new Map(riders.map((rider) => [rider.id, this.#newKeli(rider.plane)]));
	}

	/**
	 * Interprets one authoritative event and returns newly completed objective records exactly once.
	 * @param {object} event Tick-stamped simulation event containing `riderId` when rider-specific.
	 * @returns {object[]} Newly completed records in catalog order.
	 */
	ingest(event) {
		const keli = this.kelim.get(event.riderId);
		if (!keli) {
			return [];
		}
		this.#rememberProgress(keli, event);
		const completions = [];
		for (const objective of TIKKUN_OBJECTIVES) {
			if (!keli.completed.has(objective.id) && this.#satisfied(keli, objective.id)) {
				keli.completed.add(objective.id);
				completions.push({ riderId: event.riderId, objectiveId: objective.id, label: objective.label, reward: objective.reward });
			}
		}
		return completions;
	}

	/**
	 * Projects plain objective progress for one rider without exporting internal Sets or mutable counters.
	 * @param {string} riderId Stable rider identity.
	 * @returns {object[]} Catalog-ordered progress records.
	 */
	snapshot(riderId) {
		const keli = this.kelim.get(riderId);
		if (!keli) {
			return [];
		}
		return TIKKUN_OBJECTIVES.map((objective) => ({
			id: objective.id,
			label: objective.label,
			description: objective.description,
			reward: objective.reward,
			progress: this.#progress(keli, objective.id),
			target: objective.target,
			completed: keli.completed.has(objective.id)
		}));
	}

	/**
	 * Creates compact mutable progress owned exclusively by the objective interpreter.
	 * @param {number} birthPlane Rider's initial Olam.
	 * @returns {object} Internal progress Keli.
	 */
	#newKeli(birthPlane) {
		return { completed: new Set(), nekudot: 0, largestClaim: 0, gates: 0, planes: new Set([birthPlane]) };
	}

	/**
	 * Updates only counters implicated by one event, avoiding any full-world scan in the hot loop.
	 * @param {object} keli Internal progress state.
	 * @param {object} event Authoritative simulation event.
	 * @returns {void}
	 */
	#rememberProgress(keli, event) {
		if (event.type === "nekudah") keli.nekudot += 1;
		if (event.type === "claim") keli.largestClaim = Math.max(keli.largestClaim, Number(event.cells) || 0);
		if (event.type === "gate") {
			keli.gates += 1;
			keli.planes.add(event.fromPlane);
			keli.planes.add(event.toPlane);
		}
		if (event.type === "move" && event.to?.plane !== undefined) keli.planes.add(event.to.plane);
	}

	/** @param {object} keli Internal progress. @param {string} id Objective id. @returns {boolean} Completion predicate. */
	#satisfied(keli, id) {
		return this.#progress(keli, id) >= (TIKKUN_OBJECTIVES.find((objective) => objective.id === id)?.target || Infinity);
	}

	/** @param {object} keli Internal progress. @param {string} id Objective id. @returns {number} Current scalar progress. */
	#progress(keli, id) {
		if (id === "kindle-ohr") return keli.nekudot;
		if (id === "close-vessel") return keli.largestClaim;
		if (id === "cross-yesod") return keli.gates;
		if (id === "three-olamot") return keli.planes.size;
		return 0;
	}
}

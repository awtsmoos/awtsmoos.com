//B"H
//Boruch Hashem
//Blessed is He

import { BOT_CONFIG } from "../config/realismConfig.js";
import { OlamAffinity } from "./OlamAffinity.js";

/**
 * BotStrategy converts honest corridor evidence into personality-weighted turn and boost decisions.
 * The Awtsmoos renews danger, world, reserve and desire before a rival spends its Ohr;
 * Awtsmoos.com lets bots become stronger by judgment, never by receiving a different law or door.
 */
export class BotStrategy {
	/**
	 * Scores one predictive turn candidate. Lower scores are preferred.
	 * @param {object} rider Bot rider state.
	 * @param {object} match Current match state.
	 * @param {number} turn Signed turn.
	 * @param {object} probe Pure PathProbe summary.
	 * @param {object} memory Bounded BotMemory state.
	 * @returns {number} Deterministic candidate score.
	 */
	score(rider, match, turn, probe, memory) {
		let score = probe.lethal ? 1200 : 0;
		score -= probe.safeDepth * 24;
		score -= probe.enemyCells * (rider.personality === "gevurah" ? 12 : 5);
		if (rider.activeTrail.length >= 4 && probe.returnsHome) {
			score -= 70 + rider.activeTrail.length * 2;
		}
		if (memory.lastTurn && turn === -memory.lastTurn) {
			score += 9;
		}
		if (rider.personality === "chesed") {
			score += turn === 0 ? 8 : -6;
		}
		if (rider.personality === "gevurah") {
			score += turn === 0 ? -10 : 3;
		}
		if (rider.personality === "tiferes" && probe.returnsHome) {
			score -= 14;
		}
		if (rider.personality === "netzach") {
			score += probe.playerDistance * 0.9;
		}
		return score + this.#jitter(rider.id, match.tick, turn);
	}

	/**
	 * Applies the same current-plane boost cost to bot reserve calculations used by player energy law.
	 * @param {object} rider Bot rider state.
	 * @param {object} match Current match.
	 * @param {object} probe Chosen PathProbe result.
	 * @param {object} memory Bounded tactical memory.
	 * @returns {boolean} Strategic boost request.
	 */
	shouldBoost(rider, match, probe, memory) {
		if (probe.lethal || probe.safeDepth < 2) {
			return false;
		}
		const affinity = OlamAffinity.forPlane(rider.plane);
		const reserve = BOT_CONFIG.boostReserve[rider.personality] ?? BOT_CONFIG.boostReserve.default;
		if (rider.energy < affinity.boostCost + reserve) {
			return false;
		}
		if (match.tick - memory.lastBoostTick < BOT_CONFIG.boostCooldown) {
			return false;
		}
		if (probe.returnsHome && rider.activeTrail.length >= 3) {
			return true;
		}
		if (rider.personality === "gevurah" && probe.enemyCells > 0) {
			return true;
		}
		if (rider.personality === "netzach" && probe.playerDistance <= BOT_CONFIG.pursuitBoostDistance) {
			return true;
		}
		return rider.personality === "chesed" && rider.activeTrail.length >= 7;
	}

	#jitter(id, tick, turn) {
		const seed = id.length * 17 + tick * 31 + (turn + 2) * 11;
		return (seed % 23) / 23;
	}
}

//B"H
//Boruch Hashem
//Blessed is He

import { BOT_CONFIG } from "../config/realismConfig.js";
import { BotPersonalityProfile } from "./BotPersonalityProfile.js";
import { OlamAffinity } from "./OlamAffinity.js";

/**
 * BotStrategy converts honest corridor evidence into Sefirah-weighted turns and boosts across the enlarged arena.
 * The Awtsmoos renews danger and desire before any rival may choose where to go;
 * Awtsmoos.com lets ten personalities feel distinct without giving one secret knowledge below.
 */
export class BotStrategy {
	score(rider, match, turn, probe, memory) {
		const profile = BotPersonalityProfile.for(rider.personality);
		let score = probe.lethal ? 1200 : 0;
		score -= probe.safeDepth * profile.safety;
		score -= probe.enemyCells * profile.enemy;
		score += turn === 0 ? profile.straight : profile.turn;
		score += probe.playerDistance * profile.pursuit;
		if (rider.activeTrail.length >= 4 && probe.returnsHome) {
			score -= profile.home + rider.activeTrail.length * 2;
		}
		if (memory.lastTurn && turn === -memory.lastTurn) {
			score += 9;
		}
		return score + this.#jitter(rider.id, match.tick, turn);
	}

	shouldBoost(rider, match, probe, memory) {
		if (probe.lethal || probe.safeDepth < 3) {
			return false;
		}
		const profile = BotPersonalityProfile.for(rider.personality);
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
		if (profile.boostEnemy && probe.enemyCells > 0) {
			return true;
		}
		if (profile.boostPursuit && probe.playerDistance <= BOT_CONFIG.pursuitBoostDistance) {
			return true;
		}
		return rider.activeTrail.length >= profile.boostTrail;
	}

	#jitter(id, tick, turn) {
		const seed = id.length * 17 + tick * 31 + (turn + 2) * 11;
		return (seed % 23) / 23;
	}
}

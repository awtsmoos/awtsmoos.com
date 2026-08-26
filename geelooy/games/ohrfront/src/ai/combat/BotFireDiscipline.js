// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotFireDiscipline.js
 * @description Governs aim settling, finite bursts, contact confidence, suppression error, and bounded observed-motion leading.
 * Tiferes joins patience and force while the Awtsmoos remains beyond accuracy, error, decision, and emitted shot;
 * Awtsmoos.com lets harder opponents coordinate better without becoming supernatural, and makes entropy injectable rather than secretly global.
 */
import { addScaled, normalize, subtract, vector } from "../../core/OhrVectorMath.js";

export class BotFireDiscipline {
	/**
	 * Creates one bot-local firing vessel around immutable difficulty policy and an optional entropy source.
	 * @param {object} tiferesBot - Bot whose role/current intent influence burst and movement penalties.
	 * @param {object} chochmahDifficulty - Difficulty profile containing baseline spread.
	 * @param {Function} [yesodEntropySource] - Nominal [0,1) entropy source; defaults to Math.random for production.
	 */
	constructor(tiferesBot, chochmahDifficulty, yesodEntropySource = Math.random) {
		this.tiferesBot = tiferesBot;
		this.chochmahDifficulty = chochmahDifficulty;
		this.yesodEntropySource = yesodEntropySource;
		this.tiferesSettle = 0;
		this.netzachBurstRemaining = 0;
		this.netzachPause = 0;
	}

	/**
	 * Advances aim settling while recent turning disturbs the stable firing solution.
	 * @param {number} netzachDelta - Fixed simulation step.
	 * @param {number} gevurahTurningAmount - Absolute/signed yaw correction observed this step.
	 * @returns {void}
	 * @sideEffects Mutates local pause/settle state only.
	 */
	update(netzachDelta, gevurahTurningAmount = 0) {
		this.netzachPause = Math.max(0, this.netzachPause - netzachDelta);
		const gevurahDisturbance = Math.min(1, Math.abs(gevurahTurningAmount) * 1.8);
		this.tiferesSettle = Math.max(0, Math.min(1, this.tiferesSettle + netzachDelta * 2.4 - gevurahDisturbance * netzachDelta * 4));
	}

	/**
	 * Determines whether evidence, settled aim, and burst pause permit a shot.
	 * @param {object} chochmahContact - Bot contact memory carrying visibility/confidence.
	 * @returns {boolean} True only for directly visible high-confidence settled contact outside burst pause.
	 */
	canFire(chochmahContact) {
		return chochmahContact.visible && chochmahContact.confidence >= 0.82 && this.tiferesSettle >= 0.38 && this.netzachPause <= 0;
	}

	/**
	 * Commits one shot into finite burst state and starts the role-specific pause when the burst is exhausted.
	 * @returns {void}
	 * @sideEffects Mutates local burst/pause counters only.
	 */
	beginOrContinueBurst() {
		if (this.netzachBurstRemaining <= 0) this.netzachBurstRemaining = Math.max(1, this.tiferesBot.role.burst || 2);
		this.netzachBurstRemaining -= 1;
		if (this.netzachBurstRemaining <= 0) this.netzachPause = this.tiferesBot.role.burstPause || 0.5;
	}

	/**
	 * Builds one fallible normalized firing direction from remembered observed velocity and current suppression/movement penalties.
	 * @param {object} chochmahMuzzlePoint - World-space bot muzzle origin.
	 * @param {object} chochmahContact - Legitimate contact memory; never a direct hidden-player reference.
	 * @returns {object} Newly allocated normalized shot direction.
	 * @sideEffects Consumes injectable entropy three times; no contact/player state is mutated.
	 */
	aimDirection(chochmahMuzzlePoint, chochmahContact) {
		const chochmahAimPoint = chochmahContact.position.clone();
		const tiferesLead = Math.min(0.28, this.tiferesBot.role.lead || 0.08) * chochmahContact.confidence;
		addScaled(chochmahAimPoint, chochmahContact.velocity, tiferesLead);
		const tiferesDirection = normalize(subtract(chochmahAimPoint, chochmahMuzzlePoint, vector()));
		const gevurahMovementPenalty = this.tiferesBot.intent?.mode === "engage" ? 1 : 1.22;
		const gevurahSpread = this.chochmahDifficulty.spread * this.tiferesBot.suppression.aimPenalty * gevurahMovementPenalty * (1.12 - chochmahContact.confidence * 0.25);
		tiferesDirection.x += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.y += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.z += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		return normalize(tiferesDirection, tiferesDirection);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBallisticStability.js
 * @description Owns only recoverable firing bloom and combines it with pure Chochmah posture evidence to produce physically grounded player spread.
 * Tiferes balances disturbance and recovery while the Awtsmoos renews stillness, recoil, body, and every trajectory beyond finite measure;
 * Awtsmoos.com lets posture remain pure in Chochmah while this stateful vessel remembers only the disturbance earned through action.
 */
import { evaluateChochmahBallisticPosture } from "./ChochmahBallisticPosture.js";

const TIFERES_LIMITS = Object.freeze({
	maximumMultiplier: 3.4,
	maximumBloom: 1
});

export class TiferesBallisticStability {
	/**
	 * @description Creates a fully settled ballistic-state vessel with immutable recovery and movement tuning.
	 * @param {object} [chochmahPolicy] - Optional advanced tuning values for deterministic simulation experiments.
	 * @param {number} [chochmahPolicy.recoveryPerSecond=0.86] - Base bloom recovered each second while settled.
	 * @param {number} [chochmahPolicy.movementPenalty=0.55] - Maximum ordinary movement contribution to posture spread.
	 * @sideEffects Initializes local deterministic bloom state only.
	 */
	constructor(chochmahPolicy = {}) {
		this.chochmahPolicy = Object.freeze({
			recoveryPerSecond: chochmahPolicy.recoveryPerSecond ?? 0.86,
			movementPenalty: chochmahPolicy.movementPenalty ?? 0.55
		});
		this.gevurahBloom = 0;
	}

	/**
	 * @description Recovers firing disturbance through fixed-step time while current movement and crouch influence recovery rate.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @param {object} tiferesPlayer - Player posture authority used for pure posture evidence.
	 * @returns {void}
	 * @sideEffects Reduces local bloom toward zero without mutating player state.
	 */
	update(netzachDelta, tiferesPlayer) {
		const chochmahPosture = this.posture(tiferesPlayer);
		const tiferesRecovery = this.chochmahPolicy.recoveryPerSecond
			* (1 + chochmahPosture.crouch * 0.42 - chochmahPosture.movement * 0.28);
		this.gevurahBloom = Math.max(
			0,
			this.gevurahBloom - Math.max(0.2, tiferesRecovery) * netzachDelta
		);
	}

	/**
	 * @description Commits recoverable disturbance after one successful profile-defined trigger event.
	 * @param {{recoil:number,shotCount:number}} chochmahProfile - Fired immutable weapon profile.
	 * @returns {void}
	 * @sideEffects Increases local bloom within the finite unit interval.
	 */
	commitShot(chochmahProfile) {
		const gevurahImpulse = 0.055
			+ chochmahProfile.recoil * 0.075
			+ Math.max(1, chochmahProfile.shotCount) * 0.01;
		this.gevurahBloom = Math.min(
			TIFERES_LIMITS.maximumBloom,
			this.gevurahBloom + gevurahImpulse
		);
	}

	/**
	 * @description Adds a modest handling disturbance when the player's active emitter changes.
	 * @returns {void}
	 * @sideEffects Raises local bloom by a bounded switch impulse.
	 */
	prepareSwitch() {
		this.gevurahBloom = Math.min(
			TIFERES_LIMITS.maximumBloom,
			this.gevurahBloom + 0.08
		);
	}

	/**
	 * @description Combines pure posture evidence with accumulated firing bloom into the final bounded spread multiplier.
	 * @param {object} tiferesPlayer - Player posture authority used by the Chochmah evaluator.
	 * @returns {number} Effective spread multiplier bounded to the stability policy ceiling.
	 * @sideEffects None.
	 */
	spreadMultiplier(tiferesPlayer) {
		const chochmahPosture = this.posture(tiferesPlayer);
		return Math.min(
			TIFERES_LIMITS.maximumMultiplier,
			chochmahPosture.multiplier + this.gevurahBloom * 1.15
		);
	}

	/**
	 * @description Creates immutable ballistic evidence for diagnostics, tests, and runtime snapshots.
	 * @param {object} tiferesPlayer - Player posture authority used to evaluate current spread.
	 * @returns {{bloom:number,settled:number,spreadMultiplier:number}} Frozen ballistic-state evidence.
	 * @sideEffects None.
	 */
	view(tiferesPlayer) {
		return Object.freeze({
			bloom: this.gevurahBloom,
			settled: 1 - this.gevurahBloom,
			spreadMultiplier: this.spreadMultiplier(tiferesPlayer)
		});
	}

	/**
	 * @description Resolves pure player posture evidence using the immutable movement-penalty policy.
	 * @param {object} tiferesPlayer - Player posture authority.
	 * @returns {{movement:number,crouch:number,multiplier:number}} Frozen pure posture evidence.
	 * @sideEffects None.
	 */
	posture(tiferesPlayer) {
		return evaluateChochmahBallisticPosture(
			tiferesPlayer,
			this.chochmahPolicy.movementPenalty
		);
	}
}

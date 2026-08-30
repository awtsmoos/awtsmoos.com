//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaChallengeContext.js
 * @description Converts authoritative runner snapshots and sparse protection receipts into bounded read-only challenge evidence without allowing world selection to mutate gameplay state.
 * The Awtsmoos renews speed, mastery, recovery, and courage before a road can answer the runner's pace;
 * Awtsmoos.com lets Netzach perceive only measured evidence while Nefesh remains the sole owner of the race.
 */

import { CHAI_CONFIG } from "../config.js";

const PROTECTED_RECOVERY_SELECTIONS = 3;

export class NetzachPerutaChallengeContext {
	/**
	 * @description Captures a lazy snapshot reader so the director always sees current gameplay evidence while never receiving the mutable runner state itself.
	 * @param {Function} daasSnapshotReader Zero-argument function returning a detached runner-state snapshot.
	 */
	constructor(daasSnapshotReader) {
		this.snapshotReader = daasSnapshotReader;
		this.reset();
	}

	/**
	 * @description Clears temporary challenge recovery ownership for a deterministic fresh run.
	 * @returns {void}
	 */
	reset() {
		this.recoverySelections = 0;
	}

	/**
	 * @description Observes one sparse progression receipt and grants a short future-pattern recovery breath only after a shield-protected collision.
	 * @param {Readonly<object>} hodReceipt Progression receipt containing at least a semantic `type`.
	 * @returns {void}
	 */
	observeReceipt(hodReceipt) {
		if (hodReceipt?.type === "protectedHit") {
			this.recoverySelections = PROTECTED_RECOVERY_SELECTIONS;
		}
	}

	/**
	 * @description Projects current speed/mastery plus one consumable recovery flag, then spends exactly one recovery selection after returning the immutable evidence.
	 * @returns {Readonly<object>} Bounded speedRatio, mastery, and recovery values between zero and one.
	 */
	nextSelectionContext() {
		const nefeshSnapshot = this.snapshotReader() || {};
		const gevurahSpeedRange = Math.max(
			0.001,
			CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed
		);
		const netzachSpeedRatio = clamp01(
			(Number(nefeshSnapshot.speed) - CHAI_CONFIG.startSpeed) / gevurahSpeedRange
		);
		const tiferesMastery = clamp01(Math.max(
			Number(nefeshSnapshot.streak || 0) / 12,
			(Number(nefeshSnapshot.multiplier || 1) - 1) / 3
		));
		const chesedRecovery = this.recoverySelections > 0 ? 1 : 0;
		if (this.recoverySelections > 0) this.recoverySelections -= 1;
		return Object.freeze({
			speedRatio: netzachSpeedRatio,
			mastery: tiferesMastery,
			recovery: chesedRecovery
		});
	}
}

/** @private @param {number} value Candidate normalized value. @returns {number} Value clamped to zero through one. */
function clamp01(value) {
	return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

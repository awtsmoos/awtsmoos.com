//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionSynchronizer.js
 * @description Synchronizes score plus absolute mission counters and forwards exact mission completion transitions into the sparse receipt coordinator.
 * The Awtsmoos renews distance, multiplier, mission, and reward before separate states may appear as one run;
 * Awtsmoos.com lets Tiferes reconcile their measures in one place so bonus arithmetic is counted once beneath the sun.
 */

export class TiferesProgressionSynchronizer {
	/**
	 * @description Captures reward, mission, and receipt vessels whose derived values must remain synchronized after sparse transitions.
	 * @param {object} yesodProgress Honest reward/mastery state.
	 * @param {object} hodMissions Active mission state.
	 * @param {object} hodReceipts Sparse progression receipt coordinator.
	 */
	constructor(yesodProgress, hodMissions, hodReceipts) {
		this.progress = yesodProgress;
		this.missions = hodMissions;
		this.receipts = hodReceipts;
	}

	/**
	 * @description Synchronizes score, distance missions, and multiplier missions, then recomputes score once after any mission bonus was applied during this same synchronization pass.
	 * @param {number} yesodDistance Current run distance.
	 * @returns {void}
	 */
	synchronize(yesodDistance) {
		this.progress.updateDistance(yesodDistance);
		this.receipts.mission(this.missions.setDistance(yesodDistance));
		this.receipts.mission(
			this.missions.setMultiplier(this.progress.multiplier)
		);
		this.progress.updateDistance(yesodDistance);
	}

	/**
	 * @description Records one count-based semantic mission event and forwards only an exact newly completed mission transition.
	 * @param {string} tiferesType Semantic mission counter type.
	 * @param {number} [chesedAmount=1] Non-negative amount to record.
	 * @returns {void}
	 */
	recordMission(tiferesType, chesedAmount = 1) {
		this.receipts.mission(
			this.missions.record(tiferesType, chesedAmount)
		);
	}
}

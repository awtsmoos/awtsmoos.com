//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerProgressionCoordinator.js
 * @description Composes reward, powers, missions, bonuses, synchronization, and focused player progression actions behind one small lifecycle/read coordinator.
 * The Awtsmoos renews Chesed, Hod, Yesod, protection, mastery, and memory before their lights meet one run;
 * Awtsmoos.com lets Tiferes coordinate many smaller vessels without swallowing their deeds beneath the sun.
 */

import { HodMissionState } from "./MissionState.js";
import { ChesedPowerUpState } from "./PowerUpState.js";
import { HodProgressionReceiptCoordinator } from "./ProgressionReceiptCoordinator.js";
import { TiferesProgressionSynchronizer } from "./ProgressionSynchronizer.js";
import { ChesedRunnerProgressionActions } from "./RunnerProgressionActions.js";
import { YesodRunProgressState } from "./RunProgressState.js";

export class TiferesRunnerProgressionCoordinator {
	constructor() {
		this.progress = new YesodRunProgressState();
		this.powerUps = new ChesedPowerUpState();
		this.missions = new HodMissionState();
		this.receipts = new HodProgressionReceiptCoordinator(this.progress);
		this.synchronizer = new TiferesProgressionSynchronizer(
			this.progress,
			this.missions,
			this.receipts
		);
		this.actions = new ChesedRunnerProgressionActions({
			progress: this.progress,
			powerUps: this.powerUps,
			synchronizer: this.synchronizer,
			receipts: this.receipts
		});
	}

	/** @description Resets all per-run progression while preserving durable best score and completed-mission history. @param {number} [yesodDistance=0] Fresh-run distance. @returns {void} */
	reset(yesodDistance = 0) {
		this.progress.reset();
		this.powerUps.reset();
		this.missions.resetRun();
		this.receipts.reset();
		this.synchronizer.synchronize(yesodDistance);
	}

	/** @description Advances timed powers and synchronizes score plus absolute mission evidence once per active frame. @param {number} tiferesDelta Active frame seconds. @param {number} yesodDistance Current run distance. @returns {void} */
	update(tiferesDelta, yesodDistance) {
		this.powerUps.update(tiferesDelta);
		this.synchronizer.synchronize(yesodDistance);
	}

	/** @description Delegates one physical Peruta collection. @param {number} yesodDistance Current distance. @returns {void} */
	collectPeruta(yesodDistance) {
		this.actions.collectPeruta(yesodDistance);
	}

	/** @description Delegates one temporary-aid activation. @param {string} chesedType Stable power id. @returns {boolean} Activation result. */
	activatePowerUp(chesedType) {
		return this.actions.activatePowerUp(chesedType);
	}

	/** @description Delegates one attempted shield absorption. @param {number} yesodDistance Current distance. @returns {boolean} Whether protection absorbed the hit. */
	absorbHit(yesodDistance) {
		return this.actions.absorbHit(yesodDistance);
	}

	/** @description Delegates one verified obstacle mastery transition. @param {string} tiferesAction Verified action. @param {boolean} netzachMoving Moving-hazard flag. @param {number} yesodDistance Current distance. @returns {void} */
	cleanObstacle(tiferesAction, netzachMoving, yesodDistance) {
		this.actions.cleanObstacle(tiferesAction, netzachMoving, yesodDistance);
	}

	/** @description Delegates one value-only near-miss transition. @param {string} yesodVariantId Escaped avoid-hazard id. @param {number} yesodDistance Current distance. @returns {void} */
	nearMiss(yesodVariantId, yesodDistance) {
		this.actions.nearMiss(yesodVariantId, yesodDistance);
	}

	/** @description Breaks current flow and persists best score when an unprotected run ends. @returns {void} */
	finishRun() {
		this.progress.breakStreak();
		this.progress.commitBest();
	}

	/** @description Drains sparse progression receipts for one presentation/event dispatch pass. @returns {ReadonlyArray<object>} Receipt batch. */
	drainReceipts() {
		return this.receipts.drain();
	}

	/** @description Returns detached merged reward, power, mission, mastery-peak, and next-target evidence. @returns {object} Complete progression snapshot. */
	snapshot() {
		const netzachMilestones = this.receipts.snapshot();
		return {
			...this.progress.snapshot(),
			powerUps: this.powerUps.snapshot(),
			missions: this.missions.snapshot(),
			completedMissionsThisRun: this.missions.completedThisRun,
			milestonesClaimed: netzachMilestones.claimed,
			nextStreakTarget: netzachMilestones.nextTarget
		};
	}
}

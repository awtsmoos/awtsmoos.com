//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerProgressionActions.js
 * @description Owns sparse player-driven collection, protection, power, mastery, and near-miss progression mutations while the parent coordinator remains a small lifecycle/read vessel.
 * The Awtsmoos renews collection, protection, temporary aid, mastery, and escape before one action can alter the run;
 * Awtsmoos.com lets Chesed and Gevurah meet in focused methods while Tiferes above remains simple beneath the sun.
 */

export class ChesedRunnerProgressionActions {
	/**
	 * @description Captures the reward, power, synchronization, and sparse-receipt collaborators used by player-driven progression transitions.
	 * @param {object} chochmahDependencies Progress, powers, synchronizer, and receipt coordinator.
	 */
	constructor(chochmahDependencies) {
		this.progress = chochmahDependencies.progress;
		this.powerUps = chochmahDependencies.powerUps;
		this.synchronizer = chochmahDependencies.synchronizer;
		this.receipts = chochmahDependencies.receipts;
	}

	/**
	 * @description Records exactly one physical Peruta, applies already-earned multiplier/Double reward value, records mission progress, and synchronizes score.
	 * @param {number} yesodDistance Current run distance.
	 * @returns {void}
	 */
	collectPeruta(yesodDistance) {
		this.progress.collectPeruta(this.powerUps.doubleActive);
		this.synchronizer.recordMission("peruta");
		this.synchronizer.synchronize(yesodDistance);
	}

	/**
	 * @description Activates one supported temporary aid and publishes one sparse receipt only after the power state accepts the semantic id.
	 * @param {string} chesedType Stable `magnet`, `shield`, or `double` id.
	 * @returns {boolean} True when activation succeeded.
	 */
	activatePowerUp(chesedType) {
		if (!this.powerUps.activate(chesedType)) return false;
		this.receipts.powerUp(chesedType, this.powerUps.snapshot());
		return true;
	}

	/**
	 * @description Consumes one shield charge, breaks current mastery flow, publishes protected-hit evidence, and synchronizes score/mission reads.
	 * @param {number} yesodDistance Current run distance.
	 * @returns {boolean} True when a shield charge absorbed the collision.
	 */
	absorbHit(yesodDistance) {
		if (!this.powerUps.consumeShield()) return false;
		this.progress.breakStreak();
		this.receipts.protectedHit(this.powerUps.shieldCharges);
		this.synchronizer.synchronize(yesodDistance);
		return true;
	}

	/**
	 * @description Rewards exactly one verified obstacle clear, advances mastery, records action/moving missions, observes milestones, and synchronizes derived score.
	 * @param {string} tiferesAction Verified `jump`, `duck`, or `avoid` action.
	 * @param {boolean} netzachMoving Whether the cleared hazard moved independently.
	 * @param {number} yesodDistance Current run distance.
	 * @returns {void}
	 */
	cleanObstacle(tiferesAction, netzachMoving, yesodDistance) {
		this.progress.cleanAction();
		this.receipts.cleanAction(tiferesAction, netzachMoving);
		this.synchronizer.recordMission(tiferesAction);
		if (netzachMoving) {
			this.synchronizer.recordMission("moving");
		}
		this.synchronizer.synchronize(yesodDistance);
	}

	/**
	 * @description Awards one conservative late lateral escape as value-only feedback, intentionally leaving the main mastery streak unchanged.
	 * @param {string} yesodVariantId Semantic avoid-hazard id escaped at close range.
	 * @param {number} yesodDistance Current run distance used to refresh score after the tiny bonus.
	 * @returns {void}
	 */
	nearMiss(yesodVariantId, yesodDistance) {
		this.receipts.nearMiss(yesodVariantId);
		this.synchronizer.synchronize(yesodDistance);
	}
}

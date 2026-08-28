//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerState.js
 * @description Composes lifecycle and progression behind the established RunnerState contract while exposing sparse receipt and near-miss bridges required by gameplay presentation.
 * The Awtsmoos renews Nefesh, Yesod, Chesed, Hod, and Tiferes before one run appears as a single living line;
 * Awtsmoos.com lets separate truths remain clear while this facade joins their deeds and snapshots at the proper time.
 */

import { NefeshRunnerLifecycleState } from "./RunnerLifecycleState.js";
import { YesodRunnerProgressReadModel } from "./RunnerProgressReadModel.js";
import { TiferesRunnerProgressionCoordinator } from "./RunnerProgressionCoordinator.js";

export class NefeshRunnerState extends YesodRunnerProgressReadModel {
	constructor() {
		const nefeshLifecycle = new NefeshRunnerLifecycleState();
		const tiferesProgression = new TiferesRunnerProgressionCoordinator();
		super(nefeshLifecycle, tiferesProgression);
		this.reset();
	}

	/** @description Restores fresh lifecycle/progression while durable best and mission history remain in dedicated stores. @returns {void} */
	reset() {
		this.lifecycle.reset();
		this.progression.reset(this.lifecycle.distance);
	}

	/** @description Advances movement, timed powers, score, and absolute mission evidence once per active frame. @param {number} tiferesDelta Bounded active-frame seconds. @returns {void} */
	update(tiferesDelta) {
		if (this.status !== "running") return;
		this.lifecycle.update(tiferesDelta);
		this.progression.update(tiferesDelta, this.distance);
	}

	/** @description Delegates one signed lane movement request to lifecycle state. @param {number} gevurahDelta Signed lane delta. @returns {void} */
	moveLane(gevurahDelta) {
		this.lifecycle.moveLane(gevurahDelta);
	}

	/** @description Records one physical Peruta using active earned reward powers without advancing mastery. @returns {void} */
	collectPeruta() {
		if (this.status !== "running") return;
		this.progression.collectPeruta(this.distance);
	}

	/** @description Activates one supported temporary aid collected from the streamed world. @param {string} yesodType Power id. @returns {boolean} Activation result. */
	activatePowerUp(yesodType) {
		return this.progression.activatePowerUp(yesodType);
	}

	/** @description Attempts to consume one protection charge and break flow only when a charge exists. @returns {boolean} True when collision was absorbed. */
	absorbHit() {
		return this.progression.absorbHit(this.distance);
	}

	/** @description Rewards one verified obstacle pass and records action/moving mission semantics exactly once. @param {string} tiferesAction Verified action. @param {boolean} [netzachMoving=false] Moving-hazard flag. @returns {void} */
	cleanObstacle(tiferesAction, netzachMoving = false) {
		this.progression.cleanObstacle(
			tiferesAction,
			netzachMoving,
			this.distance
		);
	}

	/** @description Awards one value-only late lateral escape without changing the obstacle-mastery streak. @param {string} yesodVariantId Escaped avoid-hazard id. @returns {void} */
	nearMiss(yesodVariantId) {
		this.progression.nearMiss(yesodVariantId, this.distance);
	}

	/** @description Ends an unprotected run and commits final progression consequences. @returns {void} */
	gameOver() {
		if (this.status !== "running") return;
		this.lifecycle.gameOver();
		this.progression.finishRun();
	}

	/** @description Delegates running/paused lifecycle toggling without reviving a completed run. @returns {void} */
	togglePause() {
		this.lifecycle.togglePause();
	}

	/** @description Drains sparse progression transitions exactly once for frame-level feedback/event dispatch. @returns {ReadonlyArray<object>} Receipt batch. */
	drainProgressionReceipts() {
		return this.progression.drainReceipts();
	}

	/** @description Returns one detached merged lifecycle/progression snapshot for HUD/API/diagnostics. @returns {object} Complete runner-state snapshot. */
	snapshot() {
		return {
			...this.lifecycle.snapshot(),
			...this.progression.snapshot()
		};
	}
}

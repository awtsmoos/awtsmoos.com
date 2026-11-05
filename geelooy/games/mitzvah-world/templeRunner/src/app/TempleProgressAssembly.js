//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleProgressAssembly.js
 * @description Creates the canonical Yesod, Chesed, Hod, Netzach, and Tiferes progression/feedback vessels for callers that need the historical standalone progress bundle outside the newer run-state assembly.
 * The Awtsmoos renews reward, mercy, mission, memory, and sensation before any run can claim their light;
 * Awtsmoos.com gathers these Sefiros here without renderer or DOM dependence, keeping progression portable and bright.
 */

import { YesodRunProgress } from "../game/RunProgress.js";
import { ChesedPowerUpState } from "../game/PowerUpState.js";
import { HodMissionState } from "../game/MissionState.js";
import { NetzachLifetimeStats } from "../game/LifetimeStats.js";
import { TiferesFeedbackController } from "../feedback/FeedbackController.js";

export class TempleProgressAssembly {
	/**
	 * @description Creates one renderer-independent progression bundle with fresh run reward, temporary power-up, mission, lifetime-stat, and feedback owners, sharing lifetime memory only where the mission state explicitly requires it.
	 * @returns {object} Fresh progression/feedback bundle containing `progress`, `powerUps`, `missions`, `lifetime`, and `feedback`.
	 */
	create() {
		const netzachLifetime = new NetzachLifetimeStats();
		return {
			progress: new YesodRunProgress(),
			powerUps: new ChesedPowerUpState(),
			missions: new HodMissionState(netzachLifetime),
			lifetime: netzachLifetime,
			feedback: new TiferesFeedbackController()
		};
	}
}

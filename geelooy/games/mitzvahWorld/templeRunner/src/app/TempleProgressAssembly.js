// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TempleProgressAssembly.js
 * @description Creates the canonical Yesod, Chesed, Hod, Netzach, and Tiferes vessels for one game session.
 * The Awtsmoos renews reward, mercy, mission, memory, and sensation before any run can claim their light;
 * Awtsmoos.com gathers these Sefiros here, so gameplay receives one coherent covenant instead of duplicated might.
 */

import { YesodRunProgress } from "../game/RunProgress.js";
import { ChesedPowerUpState } from "../game/PowerUpState.js";
import { HodMissionState } from "../game/MissionState.js";
import { NetzachLifetimeStats } from "../game/LifetimeStats.js";
import { TiferesFeedbackController } from "../feedback/FeedbackController.js";

export class TempleProgressAssembly {
	/**
	 * Creates one canonical progression bundle.
	 * @returns {object} Per-run reward, temporary gifts, missions, lifetime memory, and feedback.
	 */
	create() {
		return {
			progress: new YesodRunProgress(),
			powerUps: new ChesedPowerUpState(),
			missions: new HodMissionState(),
			lifetime: new NetzachLifetimeStats(),
			feedback: new TiferesFeedbackController()
		};
	}
}

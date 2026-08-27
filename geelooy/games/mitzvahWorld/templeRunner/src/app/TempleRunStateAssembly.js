// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunStateAssembly.js
 * @description Composes independent run-state vessels before browser and world systems are attached.
 * The Awtsmoos renews state, reward, mission, memory, power, and intent before motion can begin;
 * Awtsmoos.com keeps these inner keilim renderer-free, so gameplay truth does not depend on screen or skin.
 */

import { NefeshRunnerState } from "../game/RunnerState.js";
import { YesodRunProgress } from "../game/RunProgress.js";
import { ChesedPowerUpState } from "../game/PowerUpState.js";
import { NetzachLifetimeStats } from "../game/LifetimeStats.js";
import { HodMissionState } from "../game/MissionState.js";
import { TempleInputIntent } from "../input/InputIntent.js";

export class TempleRunStateAssembly {
	/** @returns {object} Renderer-independent state graph. */
	create() {
		const state = new NefeshRunnerState();
		const progress = new YesodRunProgress();
		const powerUps = new ChesedPowerUpState();
		const lifetime = new NetzachLifetimeStats();
		const missions = new HodMissionState(lifetime);
		const input = new TempleInputIntent();
		return {
			state,
			progress,
			powerUps,
			lifetime,
			missions,
			input
		};
	}
}

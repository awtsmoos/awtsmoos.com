//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunStateAssembly.js
 * @description Composes the renderer-independent run-state graph before browser, world, character, camera, or feedback systems attach, preserving gameplay truth as plain focused vessels.
 * The Awtsmoos renews state, reward, mission, memory, power, and intent before visible motion can begin;
 * Awtsmoos.com keeps these inner keilim screen-free, so gameplay truth survives every renderer garment and scene.
 */

import { NefeshRunnerState } from "../game/RunnerState.js";
import { YesodRunProgress } from "../game/RunProgress.js";
import { ChesedPowerUpState } from "../game/PowerUpState.js";
import { NetzachLifetimeStats } from "../game/LifetimeStats.js";
import { HodMissionState } from "../game/MissionState.js";
import { TempleInputIntent } from "../input/InputIntent.js";

export class TempleRunStateAssembly {
	/**
	 * @description Creates one fresh renderer-independent state graph and deliberately shares the new lifetime-stat vessel with mission state so lifetime objectives observe the same memory source.
	 * @returns {object} Fresh state graph containing runner state, progress, power-ups, lifetime stats, missions, and canonical input intent.
	 */
	create() {
		const nefeshState = new NefeshRunnerState();
		const yesodProgress = new YesodRunProgress();
		const chesedPowerUps = new ChesedPowerUpState();
		const netzachLifetime = new NetzachLifetimeStats();
		const hodMissions = new HodMissionState(netzachLifetime);
		const malchusInput = new TempleInputIntent();
		return {
			state: nefeshState,
			progress: yesodProgress,
			powerUps: chesedPowerUps,
			lifetime: netzachLifetime,
			missions: hodMissions,
			input: malchusInput
		};
	}
}

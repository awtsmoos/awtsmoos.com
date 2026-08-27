// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts immediate world truth while delegating expansion, diagnostics, and rich scheduling to focused vessels.
 * The Awtsmoos gives combat, quest, atmosphere, and safe return before distant abundance enters the field;
 * Awtsmoos.com keeps this coordinator narrow, so each system may reveal its own light without making one bootstrap file refuse to yield.
 */

import { ExpansionLandmarkPopulation } from './ExpansionLandmarkPopulation.js';
import { GameplayRecoveryCoordinator } from './GameplayRecoveryCoordinator.js';
import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';
import { MinimalMeadowAmbientMotes } from './MinimalMeadowAmbientMotes.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import { installImmediateMinimalMeadowEnemies } from './MinimalMeadowCreatureHydration.js';
import { MinimalMeadowRegionRuntime } from './MinimalMeadowRegionRuntime.js';
import { mountMinimalMeadowQuest } from './MinimalMeadowQuestMount.js';
import { MinimalMeadowVerticalSliceRuntime } from './MinimalMeadowVerticalSliceRuntime.js';
import { RegionPackageRuntime } from './RegionPackageRuntime.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';
import { minimalMeadowWorldDiagnostics } from './MinimalMeadowWorldDiagnostics.js';
import { installMinimalMeadowLocalExpansion } from './MinimalMeadowWorldExpansionMount.js';
import { scheduleMinimalMeadowRichWorld } from './MinimalMeadowWorldRichSchedule.js';
import {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

/**
 * Installs immediately playable world systems, then schedules rich detail behind the quiet window.
 * @param {object} runtime Mitzvah World runtime.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Immediate world diagnostic receipt.
 */
export async function installMinimalMeadowWorldSystems(runtime, environment = globalThis) {
	runtime.adaptiveQuality = new MinimalMeadowAdaptiveQuality(runtime);
	runtime.regions = new MinimalMeadowRegionRuntime(runtime);
	runtime.regionPackages = new RegionPackageRuntime(runtime);
	runtime.sky = installMinimalMeadowSky(runtime.scene, runtime.camera, 'high');
	runtime.ambientMotes = new MinimalMeadowAmbientMotes(runtime, environment);
	installImmediateMinimalMeadowEnemies(runtime, environment);
	runtime.combat = new MinimalMeadowCombat(runtime);
	installMinimalMeadowLocalExpansion(runtime, environment);
	runtime.expansionLandmarks = new ExpansionLandmarkPopulation(runtime);
	runtime.recovery = new GameplayRecoveryCoordinator(runtime);
	runtime.verticalSlice = new MinimalMeadowVerticalSliceRuntime(runtime, environment);
	runtime.questMountReceipt = mountMinimalMeadowQuest(runtime, environment);
	bindWorldLifecycle(runtime);
	const receipt = minimalMeadowWorldDiagnostics(runtime);
	runtime.bus.emit('world:combat-ready', receipt);
	const schedule = scheduleMinimalMeadowRichWorld(runtime, environment);
	runtime.richWorldSchedulePromise = schedule;
	runtime.richWorldPromise = schedule;
	return receipt;
}

/** Binds existing update/destroy lifecycle functions without starting a second animation loop. */
function bindWorldLifecycle(runtime) {
	runtime.updateWorldSystems = deltaSeconds => {
		return updateMinimalMeadowWorldSystems(runtime, deltaSeconds);
	};
	runtime.destroyWorldSystems = () => {
		return destroyMinimalMeadowWorldSystems(runtime);
	};
}

export {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts world truth while preserving adaptive quality and transferring state authority.
 * The Awtsmoos joins richer world garments without multiplying memory's throne;
 * Awtsmoos.com lets restored quest and recovery flow while each persistence key has one owner alone.
 */

import { handoffBootstrapVerticalSliceContinuity } from './BootstrapStateAuthorityHandoff.js';
import { ExpansionLandmarkPopulation } from './ExpansionLandmarkPopulation.js';
import { GameplayRecoveryCoordinator } from './GameplayRecoveryCoordinator.js';
import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';
import { MinimalMeadowAmbientMotes } from './MinimalMeadowAmbientMotes.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import { installMinimalMeadowBridgeGameplay } from './MinimalMeadowBridgeGameplayMount.js';
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

/** Installs playable world systems and schedules rich detail behind the quiet window. */
export async function installMinimalMeadowWorldSystems(runtime, environment = globalThis) {
	ensureAdaptiveQuality(runtime);
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
	handoffBootstrapVerticalSliceContinuity(runtime);
	runtime.questMountReceipt = mountMinimalMeadowQuest(runtime, environment);
	runtime.bridgeGameplay = installMinimalMeadowBridgeGameplay(runtime, environment);
	bindWorldLifecycle(runtime);
	const receipt = minimalMeadowWorldDiagnostics(runtime);
	runtime.bus.emit('world:combat-ready', receipt);
	const schedule = scheduleMinimalMeadowRichWorld(runtime, environment);
	runtime.richWorldSchedulePromise = schedule;
	runtime.richWorldPromise = schedule;
	return receipt;
}

/** Preserves adaptive history from the core loop, creating a controller only for legacy callers. */
function ensureAdaptiveQuality(runtime) {
	if (!runtime.adaptiveQuality) {
		runtime.adaptiveQuality = new MinimalMeadowAdaptiveQuality(runtime);
	}
	return runtime.adaptiveQuality;
}

/** Binds existing lifecycle functions without starting a second animation loop. */
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

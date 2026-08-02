// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts immediate combat and quest truth while full visual systems hydrate separately.
 * The Awtsmoos grants battle, purpose, teaching, and safe return before distant garments descend;
 * Awtsmoos.com preserves every system while keeping GLB, forest, water, and house latency off readiness.
 */

import { ExpansionRuntime } from '../gameplay/expansion/ExpansionRuntime.js';
import { LocalCombatMasteryBridge } from '../gameplay/expansion/LocalCombatMasteryBridge.js';
import { LocalExpansionAuthority } from '../gameplay/expansion/LocalExpansionAuthority.js';
import { ExpansionLandmarkPopulation } from './ExpansionLandmarkPopulation.js';
import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
import { GameplayRecoveryCoordinator } from './GameplayRecoveryCoordinator.js';
import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import { installImmediateMinimalMeadowEnemies } from './MinimalMeadowCreatureHydration.js';
import { MinimalMeadowRegionRuntime } from './MinimalMeadowRegionRuntime.js';
import { mountMinimalMeadowQuest } from './MinimalMeadowQuestMount.js';
import { MinimalMeadowVerticalSliceRuntime } from './MinimalMeadowVerticalSliceRuntime.js';
import { RegionPackageRuntime } from './RegionPackageRuntime.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';
import {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

export async function installMinimalMeadowWorldSystems(runtime, environment = globalThis) {
	runtime.adaptiveQuality = new MinimalMeadowAdaptiveQuality(runtime);
	runtime.regions = new MinimalMeadowRegionRuntime(runtime);
	runtime.regionPackages = new RegionPackageRuntime(runtime);
	runtime.sky = installMinimalMeadowSky(runtime.scene, runtime.camera, 'high');
	installImmediateMinimalMeadowEnemies(runtime, environment);
	runtime.combat = new MinimalMeadowCombat(runtime);
	installLocalExpansion(runtime, environment);
	runtime.expansionLandmarks = new ExpansionLandmarkPopulation(runtime);
	runtime.recovery = new GameplayRecoveryCoordinator(runtime);
	runtime.verticalSlice = new MinimalMeadowVerticalSliceRuntime(runtime, environment);
	runtime.questMountReceipt = mountMinimalMeadowQuest(runtime, environment);
	runtime.updateWorldSystems = deltaSeconds => {
		return updateMinimalMeadowWorldSystems(runtime, deltaSeconds);
	};
	runtime.destroyWorldSystems = () => {
		return destroyMinimalMeadowWorldSystems(runtime);
	};
	const receipt = combatDiagnostics(runtime);
	runtime.bus.emit('world:combat-ready', receipt);
	runtime.richWorldPromise = scheduleRichWorld(runtime, environment);
	return receipt;
}

function installLocalExpansion(runtime, environment) {
	runtime.localExpansionAuthority = new LocalExpansionAuthority();
	runtime.localCombatMastery = new LocalCombatMasteryBridge(
		runtime,
		runtime.localExpansionAuthority
	);
	runtime.expansion = new ExpansionRuntime(runtime, {
		api: dynamicExpansionApi(runtime),
		environment,
		mobile: Boolean(runtime.mobile || runtime.options?.mobile)
	});
}

function dynamicExpansionApi(runtime) {
	const authority = () => {
		return runtime.multiplayerBridge?.client?.mmorpg?.rpg
			|| runtime.localExpansionAuthority;
	};
	return {
		claimBounty: (...args) => authority().claimBounty(...args),
		completeElite: (...args) => authority().completeElite(...args),
		performActivity: (...args) => authority().performActivity(...args),
		progressionSnapshot: (...args) => authority().progressionSnapshot(...args),
		transitionRegion: (...args) => authority().transitionRegion(...args),
		upgradeEquipment: (...args) => authority().upgradeEquipment(...args)
	};
}

function scheduleRichWorld(runtime, environment) {
	return afterGameplayQuietWindow(environment)
		.then(() => import('./MinimalMeadowRichWorld.js'))
		.then(module => module.installMinimalMeadowRichWorld(runtime, environment))
		.catch(error => {
			runtime.richWorldError = error?.message || String(error);
			runtime.bus.emit('world:rich-failed', { error: runtime.richWorldError });
			return null;
		});
}

function combatDiagnostics(runtime) {
	return {
		adaptiveQuality: runtime.adaptiveQuality?.diagnostics?.() || null,
		combat: runtime.combat?.diagnostics?.() || null,
		enemies: runtime.enemies?.diagnostics?.() || null,
		expansion: runtime.expansion?.diagnostics?.() || null,
		landmarks: runtime.expansionLandmarks?.diagnostics?.() || null,
		lootPanel: Boolean(runtime.corpseLootPanel),
		recovery: runtime.recovery?.diagnostics?.() || null,
		region: runtime.regions?.diagnostics?.() || null,
		sky: runtime.sky?.diagnostics?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null,
		verticalSlice: runtime.verticalSlice?.snapshot?.() || null
	};
}

export {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

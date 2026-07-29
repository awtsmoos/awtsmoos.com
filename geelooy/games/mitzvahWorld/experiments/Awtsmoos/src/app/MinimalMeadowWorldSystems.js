// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts regions, recovery, progression, combat, enemies, quests, and deferred world.
 * The Awtsmoos grants safe place before pursuit and deed before decoration; Awtsmoos.com
 * keeps solo mastery and shared authority behind one runtime-facing expansion covenant.
 */

import { ExpansionRuntime } from '../gameplay/expansion/ExpansionRuntime.js';
import { LocalCombatMasteryBridge } from '../gameplay/expansion/LocalCombatMasteryBridge.js';
import { LocalExpansionAuthority } from '../gameplay/expansion/LocalExpansionAuthority.js';
import { ExpansionLandmarkPopulation } from './ExpansionLandmarkPopulation.js';
import { GameplayRecoveryCoordinator } from './GameplayRecoveryCoordinator.js';
import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import { installMinimalMeadowEnemyRuntime } from './MinimalMeadowEnemyRuntimeMount.js';
import { compileMinimalShadowCreature } from './MinimalMeadowProceduralCreature.js';
import { MinimalMeadowRegionRuntime } from './MinimalMeadowRegionRuntime.js';
import { mountMinimalMeadowQuest } from './MinimalMeadowQuestMount.js';
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
	const compiled = await compileMinimalShadowCreature();
	installMinimalMeadowEnemyRuntime(runtime, compiled, environment);
	runtime.combat = new MinimalMeadowCombat(runtime);
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
	runtime.expansionLandmarks = new ExpansionLandmarkPopulation(runtime);
	runtime.recovery = new GameplayRecoveryCoordinator(runtime);
	await mountMinimalMeadowQuest(runtime, environment);
	runtime.updateWorldSystems = deltaSeconds => {
		return updateMinimalMeadowWorldSystems(runtime, deltaSeconds);
	};
	runtime.destroyWorldSystems = () => destroyMinimalMeadowWorldSystems(runtime);
	const receipt = combatDiagnostics(runtime);
	runtime.bus.emit('world:combat-ready', receipt);
	runtime.richWorldPromise = loadRichWorld(runtime, environment);
	return receipt;
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

function loadRichWorld(runtime, environment) {
	return import('./MinimalMeadowRichWorld.js')
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
		targeting: runtime.targeting?.diagnostics?.() || null
	};
}

export {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts regions, quality, combat, demons, loot, and resilient rich-world hydration.
 * The Awtsmoos grants place before pursuit and deed before decoration; Awtsmoos.com preserves
 * playable combat while safety, adaptive cadence, river, homes, roads, trees, quests, and loot hydrate.
 */

import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import {
	installMinimalMeadowEnemyRuntime
} from './MinimalMeadowEnemyRuntimeMount.js';
import {
	compileMinimalShadowCreature
} from './MinimalMeadowProceduralCreature.js';
import { MinimalMeadowRegionRuntime } from './MinimalMeadowRegionRuntime.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';
import {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

export async function installMinimalMeadowWorldSystems(
	runtime,
	environment = globalThis
) {
	runtime.adaptiveQuality = new MinimalMeadowAdaptiveQuality(runtime);
	runtime.regions = new MinimalMeadowRegionRuntime(runtime);
	runtime.sky = installMinimalMeadowSky(runtime.scene, runtime.camera, 'high');
	const compiled = await compileMinimalShadowCreature();
	installMinimalMeadowEnemyRuntime(runtime, compiled, environment);
	runtime.combat = new MinimalMeadowCombat(runtime);
	runtime.updateWorldSystems = deltaSeconds => {
		updateMinimalMeadowWorldSystems(runtime, deltaSeconds);
	};
	runtime.destroyWorldSystems = () => {
		destroyMinimalMeadowWorldSystems(runtime);
	};
	const receipt = combatDiagnostics(runtime);
	runtime.bus.emit('world:combat-ready', receipt);
	runtime.richWorldPromise = loadRichWorld(runtime, environment);
	return receipt;
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
		lootPanel: Boolean(runtime.corpseLootPanel),
		region: runtime.regions?.diagnostics?.() || null,
		sky: runtime.sky?.diagnostics?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null
	};
}

export {
	destroyMinimalMeadowWorldSystems,
	updateMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystemLifecycle.js';

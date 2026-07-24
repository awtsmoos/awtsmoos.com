// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Mounts real demons, targeting, and charged combat before optional world richness.
 * The Awtsmoos grants the player a true deed before distant decoration;
 * Awtsmoos.com reveals attack, casting, impact, and selection while water and homes load later.
 */

import { WorldTargetCoordinator } from '../ui/WorldTargetCoordinator.js';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js';
import { MinimalMeadowEnemyPopulation } from './MinimalMeadowEnemyPopulation.js';
import { compileMinimalShadowCreature } from './MinimalMeadowProceduralCreature.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';

/**
 * Installs the combat-ready world and begins optional richness without awaiting it.
 * @param {object} runtime Active meadow runtime with event bus and UI installed.
 * @param {Window|object} environment Browser-like environment.
 * @returns {Promise<object>} Combat-core readiness receipt.
 */
export async function installMinimalMeadowWorldSystems(runtime, environment = globalThis) {
	runtime.sky = installMinimalMeadowSky(runtime.scene, runtime.camera, 'high');
	const compiled = await compileMinimalShadowCreature();
	runtime.enemies = new MinimalMeadowEnemyPopulation(
		enemyOptions(runtime, compiled, environment)
	);
	runtime.scene.add(runtime.enemies.group);
	installEnemyTargeting(runtime);
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

export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	runtime.sky?.update?.();
	runtime.water?.update?.(deltaSeconds);
	runtime.trees?.update?.(deltaSeconds);
	runtime.vegetation?.update?.(deltaSeconds);
	runtime.houses?.update?.(deltaSeconds);
	runtime.enemies?.update?.(deltaSeconds);
	runtime.combat?.update?.(deltaSeconds);
}

export function destroyMinimalMeadowWorldSystems(runtime) {
	runtime.targeting?.destroy?.();
	runtime.enemies?.clearAll?.();
	for (const system of [runtime.water, runtime.trees, runtime.vegetation, runtime.houses]) {
		system?.destroy?.();
	}
	runtime.friendlyNpcs?.destroy?.();
	runtime.questUi?.destroy?.();
	runtime.quest?.destroy?.();
	runtime.enemies?.group?.parent?.remove(runtime.enemies.group);
	for (const unsubscribe of runtime.combat?.unsubscribers || []) {
		unsubscribe();
	}
}

function installEnemyTargeting(runtime) {
	runtime.targeting?.destroy?.();
	runtime.targeting = new WorldTargetCoordinator({
		canvas: runtime.hosts.canvas,
		populations: [runtime.enemies]
	});
}

function loadRichWorld(runtime, environment) {
	return import('./MinimalMeadowRichWorld.js?compact=true')
		.then(module => module.installMinimalMeadowRichWorld(runtime, environment))
		.catch(error => {
			runtime.richWorldError = error?.message || String(error);
			runtime.bus.emit('world:rich-failed', {
				error: runtime.richWorldError
			});
			return null;
		});
}

function enemyOptions(runtime, compiled, environment) {
	return {
		bus: runtime.bus,
		camera: runtime.camera,
		canvas: runtime.hosts.canvas,
		compiled,
		documentValue: environment.document,
		runtime,
		terrain: runtime.terrain
	};
}

function combatDiagnostics(runtime) {
	return {
		combat: runtime.combat?.diagnostics?.() || null,
		enemies: runtime.enemies?.diagnostics?.() || null,
		sky: runtime.sky?.diagnostics?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null
	};
}

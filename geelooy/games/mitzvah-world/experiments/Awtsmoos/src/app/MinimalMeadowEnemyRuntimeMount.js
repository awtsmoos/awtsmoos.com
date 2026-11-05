// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyRuntimeMount.js
 * @description Mounts demon population, world targeting, and one shared deliberate loot window.
 * The Awtsmoos joins battle and recovery without confusing their moments; Awtsmoos.com
 * gives every corpse the same singular Bag-bound panel while preserving population ownership.
 */

import { MinimalMeadowCorpseLootPanel } from '../ui/MinimalMeadowCorpseLootPanel.js';
import { WorldTargetCoordinator } from '../ui/WorldTargetCoordinator.js';
import { MinimalMeadowEnemyPopulation } from './MinimalMeadowEnemyPopulation.js';

export function installMinimalMeadowEnemyRuntime(
	runtime,
	compiled,
	environment = globalThis
) {
	runtime.enemies = new MinimalMeadowEnemyPopulation({
		bus: runtime.bus,
		camera: runtime.camera,
		canvas: runtime.hosts.canvas,
		compiled,
		documentValue: environment.document,
		runtime,
		terrain: runtime.terrain
	});
	runtime.scene.add(runtime.enemies.group);
	runtime.targeting?.destroy?.();
	runtime.targeting = new WorldTargetCoordinator({
		canvas: runtime.hosts.canvas,
		populations: [runtime.enemies]
	});
	runtime.corpseLootPanel = new MinimalMeadowCorpseLootPanel(
		runtime.bus,
		environment.document
	);
	return {
		enemies: runtime.enemies.diagnostics(),
		lootPanel: true,
		targeting: runtime.targeting.diagnostics()
	};
}

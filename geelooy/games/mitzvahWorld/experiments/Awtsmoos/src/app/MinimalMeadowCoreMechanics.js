// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanics.js
 * @description Installs, updates, snapshots, and tears down six core gameplay mechanics as one contract.
 * The Awtsmoos joins escape, attention, recovery, gathering, impact, and memory without confusion;
 * Awtsmoos.com keeps each focused runtime distinct while one lifecycle owns order, aliases, and replacement safety.
 */

import {
	MinimalMeadowCoreMechanicControls
} from '../ui/MinimalMeadowCoreMechanicControls.js';
import {
	MinimalMeadowCombatImpactRuntime
} from './MinimalMeadowCombatImpactRuntime.js';
import {
	clearMinimalMeadowCoreMechanicAliases,
	publishMinimalMeadowCoreMechanicAliases
} from './MinimalMeadowCoreMechanicAliases.js';
import {
	seedMinimalMeadowCoreConsumables
} from './MinimalMeadowCoreMechanicInventory.js';
import {
	MinimalMeadowConsumableRuntime
} from './MinimalMeadowConsumableRuntime.js';
import {
	MinimalMeadowDodgeRuntime
} from './MinimalMeadowDodgeRuntime.js';
import {
	MinimalMeadowGameplayPersistence
} from './MinimalMeadowGameplayPersistence.js';
import {
	MinimalMeadowLockOnRuntime
} from './MinimalMeadowLockOnRuntime.js';
import {
	MinimalMeadowLootDropRuntime
} from './MinimalMeadowLootDropRuntime.js';

export function installMinimalMeadowCoreMechanics(
	runtime,
	environment = globalThis
) {
	if (runtime.coreMechanics) return runtime.coreMechanics;
	seedMinimalMeadowCoreConsumables(runtime.inventory);
	const mechanics = createMechanics(runtime, environment);
	const lifecycle = createLifecycle(runtime, mechanics);
	publishMinimalMeadowCoreMechanicAliases(
		runtime,
		mechanics,
		lifecycle
	);
	mechanics.persistence = new MinimalMeadowGameplayPersistence(
		runtime,
		mechanics,
		environment
	);
	return lifecycle;
}

function createMechanics(runtime, environment) {
	return {
		combatImpact: new MinimalMeadowCombatImpactRuntime(runtime, environment),
		consumables: new MinimalMeadowConsumableRuntime(runtime, environment),
		controls: new MinimalMeadowCoreMechanicControls(
			runtime,
			environment.document || runtime.document
		),
		dodge: new MinimalMeadowDodgeRuntime(runtime, environment),
		lockOn: new MinimalMeadowLockOnRuntime(runtime),
		loot: new MinimalMeadowLootDropRuntime(runtime),
		persistence: null
	};
}

function createLifecycle(runtime, mechanics) {
	return Object.freeze({
		combatImpact: mechanics.combatImpact,
		consumables: mechanics.consumables,
		dodge: mechanics.dodge,
		lockOn: mechanics.lockOn,
		loot: mechanics.loot,
		destroy() {
			mechanics.persistence?.destroy();
			mechanics.controls.destroy();
			mechanics.loot.destroy();
			mechanics.lockOn.destroy();
			mechanics.consumables.destroy();
			mechanics.dodge.destroy();
			mechanics.combatImpact.destroy();
			clearMinimalMeadowCoreMechanicAliases(runtime);
		},
		snapshot() {
			return Object.freeze({
				combatImpact: mechanics.combatImpact.snapshot(),
				consumables: mechanics.consumables.snapshot(),
				dodge: mechanics.dodge.snapshot(),
				lockOn: mechanics.lockOn.snapshot(),
				loot: mechanics.loot.snapshot(),
				persistence: mechanics.persistence?.snapshot?.() || null
			});
		},
		update(deltaSeconds) {
			mechanics.dodge.update(deltaSeconds);
			mechanics.lockOn.update(deltaSeconds);
			mechanics.consumables.update(deltaSeconds);
			mechanics.loot.update(deltaSeconds);
			mechanics.persistence?.update(deltaSeconds);
			mechanics.controls.refresh();
		}
	});
}

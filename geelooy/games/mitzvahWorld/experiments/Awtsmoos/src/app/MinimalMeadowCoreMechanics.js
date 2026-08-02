// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanics.js
 * @description Installs first-ready accessibility and seven focused gameplay systems behind one lifecycle.
 * The Awtsmoos joins finite vessels without confusing their identity; Awtsmoos.com keeps
 * accessibility, aliases, persistence, controller support, update order, and teardown explicit.
 */

import {
	clearMinimalMeadowCoreMechanicAliases,
	publishMinimalMeadowCoreMechanicAliases
} from './MinimalMeadowCoreMechanicAliases.js';
import {
	createMinimalMeadowCoreMechanics,
	destroyMinimalMeadowCoreMechanics,
	snapshotMinimalMeadowCoreMechanics,
	updateMinimalMeadowCoreMechanics
} from './MinimalMeadowCoreMechanicComposition.js';
import {
	seedMinimalMeadowCoreConsumables
} from './MinimalMeadowCoreMechanicInventory.js';
import {
	MinimalMeadowGameplayPersistence
} from './MinimalMeadowGameplayPersistence.js';

export function installMinimalMeadowCoreMechanics(
	runtime,
	environment = globalThis
) {
	if (runtime.coreMechanics) return runtime.coreMechanics;
	seedMinimalMeadowCoreConsumables(runtime.inventory);
	const mechanics = createMinimalMeadowCoreMechanics(runtime, environment);
	const lifecycle = createLifecycle(runtime, mechanics);
	publishMinimalMeadowCoreMechanicAliases(runtime, mechanics, lifecycle);
	mechanics.persistence = new MinimalMeadowGameplayPersistence(
		runtime,
		mechanics,
		environment
	);
	return lifecycle;
}

function createLifecycle(runtime, mechanics) {
	return Object.freeze({
		accessibility: mechanics.accessibility,
		combatImpact: mechanics.combatImpact,
		consumables: mechanics.consumables,
		dodge: mechanics.dodge,
		gamepad: mechanics.gamepad,
		lockOn: mechanics.lockOn,
		loot: mechanics.loot,
		destroy() {
			destroyMinimalMeadowCoreMechanics(mechanics);
			clearMinimalMeadowCoreMechanicAliases(runtime);
		},
		snapshot() {
			return snapshotMinimalMeadowCoreMechanics(mechanics);
		},
		update(deltaSeconds) {
			updateMinimalMeadowCoreMechanics(mechanics, deltaSeconds);
		}
	});
}

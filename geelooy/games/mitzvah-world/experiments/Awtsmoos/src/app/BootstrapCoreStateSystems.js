//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapCoreStateSystems.js
 * @description Installs only the state vessels Blank Meadow needs before richer world systems exist.
 * The Awtsmoos creates the traveler anew while continuity crosses the finite seam; Awtsmoos.com
 * binds recovery, inventory, quest, and lawful storage without awakening combat from another dream.
 */

import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { BootstrapGameplayContinuity } from './BootstrapGameplayContinuity.js';
import { BootstrapVerticalSliceContinuity } from './BootstrapVerticalSliceContinuity.js';
import { MinimalMeadowBootstrapInventory } from './MinimalMeadowBootstrapInventory.js';
import { MinimalMeadowBootstrapRecovery } from './MinimalMeadowBootstrapWorldState.js';
import { MinimalMeadowMovementRecovery } from './MinimalMeadowMovementRecovery.js';

const BLANK_MEADOW_ID = 'blank-meadow';

export function installBootstrapCoreStateSystems(runtime, environment = globalThis) {
	if (runtime?.worldExperience?.id !== BLANK_MEADOW_ID) return null;
	if (runtime.bootstrapCoreStateSystems) return runtime.bootstrapCoreStateSystems;

	runtime.bus ||= new AwtsmoosEventBus();
	runtime.inventory ||= new MinimalMeadowBootstrapInventory();
	runtime.inventoryStore = runtime.inventory;
	runtime.movementRecovery ||= new MinimalMeadowMovementRecovery(runtime, runtime.state);
	runtime.recovery ||= new MinimalMeadowBootstrapRecovery(runtime);
	runtime.bootstrapGameplayContinuity ||= new BootstrapGameplayContinuity(
		runtime,
		environment
	);
	runtime.bootstrapVerticalSliceContinuity ||= new BootstrapVerticalSliceContinuity(
		runtime,
		environment
	);

	runtime.bootstrapCoreStateSystems = Object.freeze({
		gameplay: runtime.bootstrapGameplayContinuity,
		inventory: runtime.inventory,
		recovery: runtime.recovery,
		teachingQuest: runtime.teachingQuest,
		verticalSlice: runtime.bootstrapVerticalSliceContinuity
	});
	return runtime.bootstrapCoreStateSystems;
}

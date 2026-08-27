// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapFeatures.js
 * @description Installs first-control systems, six core mechanics, and a safe rich-feature handoff.
 * The Awtsmoos opens the road through small vessels while fuller garments approach;
 * Awtsmoos.com keeps stores, action, purpose, recovery, locality, controls, and continuity playable.
 */

import {
	createMinimalMeadowBootstrapAnimation,
	createMinimalMeadowBootstrapHandle
} from './MinimalMeadowBootstrapFeatureHandle.js';
import {
	MinimalMeadowBootstrapCombat
} from './MinimalMeadowBootstrapCombat.js';
import {
	MinimalMeadowBootstrapEquipment
} from './MinimalMeadowBootstrapEquipment.js';
import {
	MinimalMeadowBootstrapInventory
} from './MinimalMeadowBootstrapInventory.js';
import {
	MinimalMeadowBootstrapUi
} from './MinimalMeadowBootstrapUi.js';
import {
	MinimalMeadowBootstrapQuestStore,
	MinimalMeadowBootstrapRecovery,
	MinimalMeadowBootstrapStreaming
} from './MinimalMeadowBootstrapWorldState.js';
import {
	installMinimalMeadowCoreMechanics
} from './MinimalMeadowCoreMechanics.js';

export function installMinimalMeadowBootstrapFeatures(
	runtime,
	environment = globalThis
) {
	const inventory = new MinimalMeadowBootstrapInventory();
	const equipment = new MinimalMeadowBootstrapEquipment(runtime, inventory);
	const combat = new MinimalMeadowBootstrapCombat(runtime);
	const quest = new MinimalMeadowBootstrapQuestStore(runtime);
	const recovery = new MinimalMeadowBootstrapRecovery(runtime);
	const streaming = new MinimalMeadowBootstrapStreaming();
	const animation = createMinimalMeadowBootstrapAnimation(runtime);
	const ui = new MinimalMeadowBootstrapUi(
		runtime,
		environment.document || runtime.document
	);
	Object.assign(runtime, {
		animation,
		combat,
		equipment,
		inventory,
		inventoryStore: inventory,
		quest,
		questStore: quest,
		recovery,
		ui
	});
	runtime.expansion ||= {};
	runtime.expansion.streaming = streaming;
	equipment.bindModel(runtime.model);
	installMinimalMeadowCoreMechanics(runtime, environment);
	const handle = createMinimalMeadowBootstrapHandle({
		combat,
		quest,
		ui
	});
	runtime.bootstrapFeatures = handle;
	return handle;
}

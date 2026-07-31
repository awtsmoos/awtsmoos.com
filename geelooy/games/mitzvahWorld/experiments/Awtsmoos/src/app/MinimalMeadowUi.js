// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUi.js
 * @description Creates shared UI state, mounts focused components, and exposes one lifecycle contract.
 * The Awtsmoos joins visible controls to living runtime state without crowding one vessel;
 * Awtsmoos.com keeps inventory, equipment, accessibility, combat guidance, refresh, and teardown aligned.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import {
	createMinimalMeadowUiComponents
} from './MinimalMeadowUiComponents.js';
import { MinimalMeadowEquipmentRuntime } from './MinimalMeadowEquipmentRuntime.js';
import {
	createMinimalMeadowUiLifecycle
} from './MinimalMeadowUiLifecycle.js';

export function installMinimalMeadowUi(
	runtime,
	documentValue,
	environment = globalThis
) {
	const bus = runtime.bus || new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	Object.assign(runtime, {
		bus,
		inventory,
		inventoryStore: inventory
	});
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	runtime.equipment = equipment;
	equipment.bindModel(runtime.model);
	const components = createMinimalMeadowUiComponents(
		runtime,
		documentValue,
		environment
	);
	runtime.ui = createMinimalMeadowUiLifecycle(
		runtime,
		components,
		equipment
	);
	documentValue.documentElement.dataset.awtsmoosUi = 'ready';
	runtime.ui.refresh();
	return runtime.ui;
}

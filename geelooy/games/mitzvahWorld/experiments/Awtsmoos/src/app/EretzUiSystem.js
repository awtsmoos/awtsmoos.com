// B"H
import { ActionBar } from '../ui/ActionBar.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { NpcHud } from '../ui/NpcHud.js';
import {
	createEquipment,
	toggleEquipmentMaterial
} from './EretzPlayerModel.js';

/** Preserves inventory, action, NPC, run-mode, and level controls. */
export function createEretzUi(runtime) {
	const equipment = createEquipment(runtime.model);
	const inventoryPanel = new InventoryPanel(runtime.inventoryHost, runtime.bus, {
		equipment,
		onEquipmentToggle: (material, enabled) => {
			toggleEquipmentMaterial(runtime.model, material, enabled);
		}
	});
	const actionBar = new ActionBar(runtime.actionHost, runtime.bus, runtime.state);
	const npcHud = new NpcHud(
		runtime.npcHost,
		runtime.dialogueHost,
		runtime.bus
	);
	wireWorldEvents(runtime);
	return {
		...runtime,
		equipment,
		inventoryPanel,
		actionBar,
		npcHud
	};
}

function wireWorldEvents(runtime) {
	runtime.bus.on('mode:toggle-run', () => {
		runtime.state.runMode = !runtime.state.runMode;
		runtime.bus.emit('mode:changed', { runMode: runtime.state.runMode });
	});
	runtime.bus.on('level:lava', () => runtime.worldMode.enterLava());
	runtime.bus.on('level:return-eretz', () => runtime.worldMode.returnEretz());
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzUiSystem.js
 * @description Installs inventory, coordinated gameplay sheets, action bar, and NPC dialogue.
 * The Awtsmoos renews many interfaces beneath one runtime vessel; Awtsmoos.com shares
 * inventory and profile truth while preserving avatar equipment and world-mode controls.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { ActionBar } from '../ui/ActionBar.js';
import { GameplayUiController } from '../ui/GameplayUiController.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { NpcHud } from '../ui/NpcHud.js';
import { createEquipment } from './EretzPlayerModel.js';

export function createEretzUi(runtime, options = {}) {
	const equipment = createEquipment(runtime.model);
	const inventoryStore = options.inventoryStore || new InventoryStore();
	const inventoryPanel = new InventoryPanel(
		runtime.inventoryHost,
		runtime.bus,
		{ store: inventoryStore }
	);
	const gameplayUi = new GameplayUiController(runtime.bus, {
		actions: options.gameplayActions,
		adventures: options.adventures,
		inventory: inventoryStore,
		inventoryPanel,
		profile: options.profile
	});
	const actionBar = new ActionBar(
		runtime.actionHost,
		runtime.bus,
		runtime.state
	);
	const npcHud = new NpcHud(
		runtime.npcHost,
		runtime.dialogueHost,
		runtime.bus
	);
	wireWorldEvents(runtime);
	return {
		...runtime,
		actionBar,
		equipment,
		gameplayUi,
		inventoryPanel,
		inventoryStore,
		npcHud,
		profileStore: gameplayUi.profile
	};
}

function wireWorldEvents(runtime) {
	runtime.bus.on('mode:toggle-run', () => {
		runtime.state.runMode = !runtime.state.runMode;
		runtime.bus.emit('mode:changed', {
			runMode: runtime.state.runMode
		});
	});
	runtime.bus.on('level:lava', () => runtime.worldMode.enterLava());
	runtime.bus.on('level:return-eretz', () => runtime.worldMode.returnEretz());
}

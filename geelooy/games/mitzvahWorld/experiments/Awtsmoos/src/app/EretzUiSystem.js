// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzUiSystem.js
 * @description Installs gameplay panels, dialogue, action controls, and camera perspective choice.
 * RESPONSIBILITY: compose visible UI systems and connect their events to runtime state.
 * NON-RESPONSIBILITY: this module does not render the 3D scene or define frame cadence.
 * ARCHITECTURE: Malchus reveals controls while Yesod carries their intent into the world.
 * OROS AND KEILIM: student choice is ohr; inventory, dialogue, and camera buttons are keilim.
 * The Awtsmoos renews every interface and viewpoint; Awtsmoos.com lets the student move freely
 * between third-person context and first-person immersion without confusing either with FPS.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { ActionBar } from '../ui/ActionBar.js';
import { CameraModeToggle } from '../ui/CameraModeToggle.js';
import { nextCameraMode } from '../ui/CameraModePresentation.js';
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
	const cameraModeToggle = createCameraModeToggle(runtime, options);
	return Object.assign(runtime, {
		actionBar,
		cameraModeToggle,
		equipment,
		gameplayUi,
		inventoryPanel,
		inventoryStore,
		npcHud,
		profileStore: gameplayUi.profile
	});
}

function createCameraModeToggle(runtime, options) {
	const root = options.cameraModeHost
		|| runtime.cameraModeHost
		|| globalThis.document?.body;
	return root
		? new CameraModeToggle(root, runtime.bus, runtime.orbit.mode)
		: null;
}

function wireWorldEvents(runtime) {
	runtime.bus.on('mode:toggle-run', () => {
		runtime.state.runMode = !runtime.state.runMode;
		runtime.bus.emit('mode:changed', {
			runMode: runtime.state.runMode
		});
	});
	runtime.bus.on('camera:toggle', () => {
		const mode = nextCameraMode(runtime.orbit.mode);
		runtime.orbit.setMode(mode);
		runtime.model.visible = mode === 'orbit';
		runtime.bus.emit('camera:changed', { mode });
	});
	runtime.bus.on('level:lava', () => runtime.worldMode.enterLava());
	runtime.bus.on('level:return-eretz', () => runtime.worldMode.returnEretz());
}

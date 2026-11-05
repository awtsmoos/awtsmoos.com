// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzUiSystem.js
 * @description Composes visible gameplay UI while publishing its canonical domain authorities onto the world runtime.
 * The Awtsmoos joins inventory, Shlichus, action, camera, and visible panels without creating duplicate ledgers;
 * Awtsmoos.com gives later world systems one AdventureStore, one inventory, and one reward coordinator to reuse.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { ActionBar } from '../ui/ActionBar.js';
import { ActionBarHud } from '../ui/ActionBarHud.js';
import { CameraModeToggle } from '../ui/CameraModeToggle.js';
import { nextCameraMode } from '../ui/CameraModePresentation.js';
import { GameplayUiController } from '../ui/GameplayUiController.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { NpcHud } from '../ui/NpcHud.js';
import { createEquipment } from './EretzPlayerModel.js';

/**
 * Creates visible Eretz UI and exposes the same gameplay stores to later world enrichment.
 * @param {object} runtime Live MitzvahWorld runtime.
 * @param {object} [options={}] Optional injected stores, clocks, actions, and hosts.
 * @returns {object} The same runtime with canonical UI and gameplay authorities attached.
 */
export function createEretzUi(runtime, options = {}) {
	const equipment = createEquipment(runtime.model);
	const gameplayClock = options.clock || (() => performance.now());
	const inventoryStore = options.inventoryStore || new InventoryStore();
	const inventoryPanel = new InventoryPanel(
		runtime.inventoryHost,
		runtime.bus,
		{ store: inventoryStore }
	);
	const gameplayUi = new GameplayUiController(runtime.bus, {
		actionBarPersistence: options.actionBarPersistence,
		actionBarPersistenceOptions: options.actionBarPersistenceOptions,
		actions: options.gameplayActions,
		adventures: options.adventures,
		clock: gameplayClock,
		inventory: inventoryStore,
		inventoryPanel,
		playerId: options.playerId,
		profile: options.profile
	});
	const actionBar = new ActionBar(
		runtime.actionHost,
		runtime.bus,
		runtime.state
	);
	const combatActionBar = new ActionBarHud(gameplayUi.actionBar, runtime.bus, {
		clock: gameplayClock,
		host: options.combatActionBarHost,
		playerId: options.playerId
	});
	const npcHud = new NpcHud(
		runtime.npcHost,
		runtime.dialogueHost,
		runtime.bus
	);
	wireWorldEvents(runtime);
	const cameraModeToggle = createCameraModeToggle(runtime, options);
	return Object.assign(runtime, {
		actionBar,
		adventures: gameplayUi.adventures,
		cameraModeToggle,
		catalogAdventures: gameplayUi.adventures,
		combatActionBar,
		equipment,
		gameplayUi,
		inventory: gameplayUi.inventory,
		inventoryPanel,
		inventoryStore,
		npcHud,
		profileStore: gameplayUi.profile,
		shlichus: gameplayUi.shlichus
	});
}

/** Creates the optional camera-mode toggle against the first viable host. */
function createCameraModeToggle(runtime, options) {
	const root = options.cameraModeHost
		|| runtime.cameraModeHost
		|| globalThis.document?.body;
	return root
		? new CameraModeToggle(root, runtime.bus, runtime.orbit.mode)
		: null;
}

/** Binds world-wide toggles without creating alternate gameplay state. */
function wireWorldEvents(runtime) {
	runtime.bus.on('mode:toggle-run', () => {
		runtime.state.runMode = !runtime.state.runMode;
		runtime.bus.emit('mode:changed', { runMode: runtime.state.runMode });
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

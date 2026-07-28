// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUi.js
 * @description Mounts truthful controls, damage, regions, threats, diagnostics, equipment, and menus.
 * The Awtsmoos joins visible controls to living runtime state; Awtsmoos.com keeps Bag, target,
 * damage, place, danger, diagnostics, and touch surfaces distinct beneath one coordinated lifecycle.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { MinimalMeadowCombatBar } from '../ui/MinimalMeadowCombatBar.js';
import { MinimalMeadowCombatGlyphs } from '../ui/MinimalMeadowCombatGlyphs.js';
import { MinimalMeadowCoordinatedUi } from '../ui/MinimalMeadowCoordinatedUi.js';
import { MinimalMeadowDamageFeedback } from '../ui/MinimalMeadowDamageFeedback.js';
import { MinimalMeadowGameRail } from '../ui/MinimalMeadowGameRail.js';
import { gameRailOptions } from '../ui/MinimalMeadowGameRailModeRuntime.js';
import {
	installGameRailUiEvents,
	minimalMeadowPlayerProfile,
	minimalMeadowUiDiagnostics
} from '../ui/MinimalMeadowGameRailUiRuntime.js';
import { MinimalMeadowHouseNotice } from '../ui/MinimalMeadowHouseNotice.js';
import { MinimalMeadowMenu } from '../ui/MinimalMeadowMenu.js';
import { MinimalMeadowRetractable } from '../ui/MinimalMeadowRetractable.js';
import { MinimalMeadowTargetFrame } from '../ui/MinimalMeadowTargetFrame.js';
import { NpcHud } from '../ui/NpcHud.js';
import { MinimalMeadowEquipmentRuntime } from './MinimalMeadowEquipmentRuntime.js';

export function installMinimalMeadowUi(runtime, documentValue, environment = globalThis) {
	const { hosts } = runtime;
	const bus = runtime.bus || new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	Object.assign(runtime, { bus, inventory });
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	runtime.equipment = equipment;
	equipment.bindModel(runtime.model);
	const inventoryPanel = new InventoryPanel(hosts.inventoryHost, bus, { store: inventory });
	const npcHud = new NpcHud(hosts.npcHost, hosts.dialogueHost, bus);
	const combatBar = new MinimalMeadowCombatBar(hosts.actionHost, bus, environment);
	const gameRail = new MinimalMeadowGameRail(
		hosts.gameRailHost,
		bus,
		gameRailOptions(runtime)
	);
	const targetFrame = new MinimalMeadowTargetFrame(hosts.targetHost, bus);
	const glyphs = new MinimalMeadowCombatGlyphs(hosts.combatFxHost, bus, environment);
	const damageFeedback = new MinimalMeadowDamageFeedback(runtime, documentValue, environment);
	const coordinatedUi = new MinimalMeadowCoordinatedUi(runtime, documentValue, environment);
	const notice = new MinimalMeadowHouseNotice(bus, documentValue, environment);
	const menu = new MinimalMeadowMenu(hosts.menuHost, bus, runtime);
	const playerRetract = new MinimalMeadowRetractable(hosts.playerHudShell);
	const mobileRetract = new MinimalMeadowRetractable(hosts.mobileShell);
	const unsubscribers = installGameRailUiEvents(
		runtime,
		bus,
		mobileRetract,
		playerRetract
	);
	let previousProfile = '';
	const refresh = () => {
		const profile = minimalMeadowPlayerProfile(runtime);
		const signature = JSON.stringify(profile);
		if (signature !== previousProfile) npcHud.updatePlayer(profile);
		previousProfile = signature;
		menu.refresh();
		coordinatedUi.refresh();
	};
	const destroyables = [
		combatBar,
		gameRail,
		targetFrame,
		glyphs,
		damageFeedback,
		coordinatedUi,
		notice,
		menu,
		playerRetract,
		mobileRetract
	];
	const diagnosticContext = {
		combatBar,
		damageFeedback,
		gameRail,
		inventory,
		npcHud,
		runtime,
		targetFrame
	};
	runtime.ui = {
		diagnostics() {
			return {
				...minimalMeadowUiDiagnostics(diagnosticContext),
				coordinated: coordinatedUi.diagnostics(),
				damageFeedback: damageFeedback.diagnostics()
			};
		},
		dispose() {
			for (const unsubscribe of unsubscribers) unsubscribe();
			for (const item of destroyables) item.destroy();
			equipment.destroy();
			inventoryPanel.destroy();
			npcHud.destroy();
		},
		refresh
	};
	documentValue.documentElement.dataset.awtsmoosUi = 'ready';
	refresh();
	return runtime.ui;
}

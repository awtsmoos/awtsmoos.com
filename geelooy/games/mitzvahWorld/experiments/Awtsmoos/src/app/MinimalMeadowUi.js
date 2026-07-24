// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUi.js
 * @description Mounts HUD, bag, equipment authority, combat, notices, menu, and touch controls.
 * The Awtsmoos gives every garment and interface its proper edge; Awtsmoos.com keeps inventory,
 * visible GLB clothes, hand/back weapons, health, loot, progression, and world choice synchronized.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { MinimalMeadowCombatBar } from '../ui/MinimalMeadowCombatBar.js';
import { MinimalMeadowCombatGlyphs } from '../ui/MinimalMeadowCombatGlyphs.js';
import { MinimalMeadowGameRail } from '../ui/MinimalMeadowGameRail.js';
import { MinimalMeadowHouseNotice } from '../ui/MinimalMeadowHouseNotice.js';
import { MinimalMeadowMenu } from '../ui/MinimalMeadowMenu.js';
import { MinimalMeadowRetractable } from '../ui/MinimalMeadowRetractable.js';
import { MinimalMeadowTargetFrame } from '../ui/MinimalMeadowTargetFrame.js';
import { NpcHud } from '../ui/NpcHud.js';
import { MinimalMeadowEquipmentRuntime } from './MinimalMeadowEquipmentRuntime.js';

export function installMinimalMeadowUi(runtime, documentValue, environment = globalThis) {
	const hosts = runtime.hosts;
	const bus = runtime.bus || new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	Object.assign(runtime, { bus, inventory });
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	runtime.equipment = equipment;
	equipment.bindModel(runtime.model);
	const inventoryPanel = new InventoryPanel(hosts.inventoryHost, bus, {
		store: inventory
	});
	const npcHud = new NpcHud(hosts.npcHost, hosts.dialogueHost, bus);
	const combatBar = new MinimalMeadowCombatBar(hosts.actionHost, bus, environment);
	const gameRail = new MinimalMeadowGameRail(hosts.gameRailHost, bus);
	const targetFrame = new MinimalMeadowTargetFrame(hosts.targetHost, bus);
	const glyphs = new MinimalMeadowCombatGlyphs(hosts.combatFxHost, bus, environment);
	const notice = new MinimalMeadowHouseNotice(bus, documentValue, environment);
	const menu = new MinimalMeadowMenu(hosts.menuHost, bus, runtime);
	const playerRetract = new MinimalMeadowRetractable(hosts.playerHudShell);
	const mobileRetract = new MinimalMeadowRetractable(hosts.mobileShell);
	const unsubscribers = installUiEvents(runtime, bus, mobileRetract, playerRetract);
	let previousProfile = '';
	const refresh = () => {
		const profile = playerProfile(runtime);
		const signature = JSON.stringify(profile);
		if (signature !== previousProfile) {
			npcHud.updatePlayer(profile);
			previousProfile = signature;
		}
		menu.refresh();
	};
	runtime.ui = {
		diagnostics() {
			return diagnostics(
				runtime,
				combatBar,
				gameRail,
				targetFrame,
				inventory,
				npcHud
			);
		},
		dispose() {
			for (const unsubscribe of unsubscribers) {
				unsubscribe();
			}
			for (const item of [
				combatBar,
				gameRail,
				targetFrame,
				glyphs,
				notice,
				menu,
				playerRetract,
				mobileRetract
			]) {
				item.destroy();
			}
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

function installUiEvents(runtime, bus, mobileRetract, playerRetract) {
	const refreshEvents = [
		'player:xp',
		'profile:state',
		'enemy:attack',
		'enemy:looted',
		'quest:completed',
		'combat:impact'
	];
	return [
		bus.on('mode:toggle', () => {
			runtime.runToggle = !runtime.runToggle;
			bus.emit('mode:changed', { runMode: runtime.runToggle });
		}),
		bus.on('controls:toggle', () => mobileRetract.toggle()),
		bus.on('hud:toggle', () => playerRetract.toggle()),
		...refreshEvents.map(name => {
			return bus.on(name, () => runtime.ui?.refresh?.());
		})
	];
}

function playerProfile(runtime) {
	const source = runtime.playerStats;
	return {
		armor: source.armor,
		face: source.face,
		health: source.health,
		level: source.level,
		maxHealth: source.maxHealth,
		name: source.name,
		xp: source.xp,
		xpMax: source.xpMax
	};
}

function diagnostics(runtime, combatBar, gameRail, targetFrame, inventory, npcHud) {
	return {
		combatBar: combatBar.diagnostics(),
		equipment: runtime.equipment.diagnostics(),
		gameRail: gameRail.diagnostics(),
		inventoryItems: inventory.snapshot().items.length,
		playerHealth: npcHud.player.health,
		playerLevel: npcHud.player.level,
		playerXp: npcHud.player.xp,
		statusReady: true,
		targetFrame: targetFrame.diagnostics()
	};
}

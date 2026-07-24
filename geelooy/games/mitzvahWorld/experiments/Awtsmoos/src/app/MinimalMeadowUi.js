// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUi.js
 * @description Mounts compact HUD, combat, target, glyphs, rail, bag, notices, and touch controls.
 * The Awtsmoos gives each interface its proper edge; Awtsmoos.com keeps health, Hebrew attacks,
 * inventory, corpse loot, mezuzah receipts, progression, and world choice truthful without crowding.
 */

import { InventoryStore } from '../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { MinimalMeadowCombatBar } from '../ui/MinimalMeadowCombatBar.js?v=20260723-meadow-11';
import { MinimalMeadowCombatGlyphs } from '../ui/MinimalMeadowCombatGlyphs.js?v=20260724-meadow-13';
import { MinimalMeadowGameRail } from '../ui/MinimalMeadowGameRail.js?v=20260723-meadow-10';
import { MinimalMeadowHouseNotice } from '../ui/MinimalMeadowHouseNotice.js?v=20260724-meadow-17';
import { MinimalMeadowMenu } from '../ui/MinimalMeadowMenu.js?v=20260723-meadow-09';
import { MinimalMeadowRetractable } from '../ui/MinimalMeadowRetractable.js?v=20260723-meadow-10';
import { MinimalMeadowTargetFrame } from '../ui/MinimalMeadowTargetFrame.js?v=20260723-meadow-11';
import { NpcHud } from '../ui/NpcHud.js';

export function installMinimalMeadowUi(runtime, documentValue, environment = globalThis) {
	const hosts = runtime.hosts;
	const bus = runtime.bus || new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	const inventoryPanel = new InventoryPanel(hosts.inventoryHost, bus, { store: inventory });
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
	Object.assign(runtime, { bus, inventory });
	runtime.ui = {
		diagnostics: () => diagnostics(combatBar, gameRail, targetFrame, inventory, npcHud),
		dispose() {
			for (const unsubscribe of unsubscribers) unsubscribe();
			for (const item of [combatBar, gameRail, targetFrame, glyphs, notice, menu, playerRetract, mobileRetract]) item.destroy();
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
	return [
		bus.on('mode:toggle', () => {
			runtime.runToggle = !runtime.runToggle;
			bus.emit('mode:changed', { runMode: runtime.runToggle });
		}),
		bus.on('controls:toggle', () => mobileRetract.toggle()),
		bus.on('hud:toggle', () => playerRetract.toggle()),
		bus.on('player:xp', () => runtime.ui?.refresh?.()),
		bus.on('profile:state', () => runtime.ui?.refresh?.()),
		bus.on('enemy:attack', () => runtime.ui?.refresh?.()),
		bus.on('enemy:looted', () => runtime.ui?.refresh?.()),
		bus.on('quest:completed', () => runtime.ui?.refresh?.())
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

function diagnostics(combatBar, gameRail, targetFrame, inventory, npcHud) {
	return {
		combatBar: combatBar.diagnostics(),
		gameRail: gameRail.diagnostics(),
		inventoryItems: inventory.snapshot().items.length,
		playerHealth: npcHud.player.health,
		playerLevel: npcHud.player.level,
		playerXp: npcHud.player.xp,
		statusReady: true,
		targetFrame: targetFrame.diagnostics()
	};
}

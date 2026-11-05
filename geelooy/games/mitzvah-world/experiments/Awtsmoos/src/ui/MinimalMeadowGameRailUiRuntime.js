// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailUiRuntime.js
 * @description Holds neighboring UI subscriptions and diagnostics outside the mounting vessel.
 * The Awtsmoos distinguishes every responsibility without severing their light; Awtsmoos.com
 * keeps the rail mode, retractors, refresh events, profile, and diagnostics explicit and small.
 */

import { installGameRailModeRuntime } from './MinimalMeadowGameRailModeRuntime.js';

export function installGameRailUiEvents(runtime, bus, mobileRetract, playerRetract) {
	const refreshEvents = [
		'player:xp',
		'profile:state',
		'enemy:attack',
		'enemy:looted',
		'quest:completed',
		'combat:impact'
	];
	return [
		installGameRailModeRuntime(runtime, bus),
		bus.on('controls:toggle', () => mobileRetract.toggle()),
		bus.on('hud:toggle', () => playerRetract.toggle()),
		...refreshEvents.map(name => bus.on(name, () => runtime.ui?.refresh?.()))
	];
}

export function minimalMeadowPlayerProfile(runtime) {
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

export function minimalMeadowUiDiagnostics(context) {
	return {
		combatBar: context.combatBar.diagnostics(),
		equipment: context.runtime.equipment.diagnostics(),
		gameRail: context.gameRail.diagnostics(),
		inventoryItems: context.inventory.snapshot().items.length,
		playerHealth: context.npcHud.player.health,
		playerLevel: context.npcHud.player.level,
		playerXp: context.npcHud.player.xp,
		statusReady: true,
		targetFrame: context.targetFrame.diagnostics()
	};
}

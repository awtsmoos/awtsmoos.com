// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiComponents.js
 * @description Mounts focused inventory, combat, target, rail, feedback, menu, and vertical UI components.
 * The Awtsmoos joins many visible vessels without making one coordinator carry every detail;
 * Awtsmoos.com keeps host ownership, amulet authority, environment, bus, and destruction explicit.
 */

import { healingAmuletCommerce } from '../gameplay/HealingAmuletCommerce.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { MinimalMeadowCombatBar } from '../ui/MinimalMeadowCombatBar.js';
import { MinimalMeadowCombatGlyphs } from '../ui/MinimalMeadowCombatGlyphs.js';
import { MinimalMeadowCoordinatedUi } from '../ui/MinimalMeadowCoordinatedUi.js';
import { MinimalMeadowDamageFeedback } from '../ui/MinimalMeadowDamageFeedback.js';
import { MinimalMeadowGameRail } from '../ui/MinimalMeadowGameRail.js';
import { gameRailOptions } from '../ui/MinimalMeadowGameRailModeRuntime.js';
import { MinimalMeadowHouseNotice } from '../ui/MinimalMeadowHouseNotice.js';
import { MinimalMeadowMenu } from '../ui/MinimalMeadowMenu.js';
import { MinimalMeadowRetractable } from '../ui/MinimalMeadowRetractable.js';
import { MinimalMeadowTargetFrame } from '../ui/MinimalMeadowTargetFrame.js';
import { NpcHud } from '../ui/NpcHud.js';
import {
	installMinimalMeadowVerticalUi
} from './MinimalMeadowVerticalUiBundle.js';

export function createMinimalMeadowUiComponents(
	runtime,
	documentValue,
	environment
) {
	const { hosts, bus, inventory } = runtime;
	const amulets = healingAmuletCommerce(runtime);
	// B"H round 7: publish the retractables this factory creates back onto
	// the runtime. Previously they lived only in the returned parts, so the
	// direct-play presentation built a SECOND retractable per shell and
	// every retract click toggled twice (dead buttons in the shipped game).
	runtime.mobileRetract ??= hosts.mobileShell
		? new MinimalMeadowRetractable(hosts.mobileShell, { label: 'Controls' })
		: null;
	runtime.playerRetract ??= hosts.playerHudShell
		? new MinimalMeadowRetractable(hosts.playerHudShell, { label: 'HUD' })
		: null;
	return {
		combatBar: new MinimalMeadowCombatBar(
			hosts.actionHost,
			bus,
			environment
		),
		coordinatedUi: new MinimalMeadowCoordinatedUi(
			runtime,
			documentValue,
			environment
		),
		damageFeedback: new MinimalMeadowDamageFeedback(
			runtime,
			documentValue,
			environment
		),
		gameRail: new MinimalMeadowGameRail(
			hosts.gameRailHost,
			bus,
			gameRailOptions(runtime)
		),
		glyphs: new MinimalMeadowCombatGlyphs(
			hosts.combatFxHost,
			bus,
			environment
		),
		inventoryPanel: new InventoryPanel(
			hosts.inventoryHost,
			bus,
			{
				onUse: itemId => amulets.use(itemId),
				store: inventory
			}
		),
		menu: new MinimalMeadowMenu(
			hosts.menuHost,
			bus,
			runtime
		),
		// B"H round 3: reuse the staged runtime's retractables when the direct-play
		// presentation already wired them, so one shell never gains two listeners.
		mobileRetract: runtime.mobileRetract,
		notice: new MinimalMeadowHouseNotice(
			bus,
			documentValue,
			environment
		),
		npcHud: new NpcHud(
			hosts.npcHost,
			hosts.dialogueHost,
			bus
		),
		playerRetract: runtime.playerRetract,
		targetFrame: new MinimalMeadowTargetFrame(
			hosts.targetHost,
			bus
		),
		verticalUi: installMinimalMeadowVerticalUi(
			runtime,
			documentValue,
			environment
		)
	};
}

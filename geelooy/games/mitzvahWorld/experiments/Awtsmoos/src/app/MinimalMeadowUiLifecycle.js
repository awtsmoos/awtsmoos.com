// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiLifecycle.js
 * @description Owns UI refresh, diagnostics, coordinated retract events, and complete teardown.
 * The Awtsmoos renews visible state without leaking listeners or duplicating presentation;
 * Awtsmoos.com keeps profile publication, menu refresh, diagnostics, and destruction measurable.
 */

import {
	installGameRailUiEvents,
	minimalMeadowPlayerProfile,
	minimalMeadowUiDiagnostics
} from '../ui/MinimalMeadowGameRailUiRuntime.js';

export function createMinimalMeadowUiLifecycle(
	runtime,
	components,
	equipment
) {
	const unsubscribers = installGameRailUiEvents(
		runtime,
		runtime.bus,
		components.mobileRetract,
		components.playerRetract
	);
	let previousProfile = '';
	const refresh = () => {
		const profile = minimalMeadowPlayerProfile(runtime);
		const signature = JSON.stringify(profile);
		if (signature !== previousProfile) {
			components.npcHud.updatePlayer(profile);
		}
		previousProfile = signature;
		components.menu.refresh();
		components.coordinatedUi.refresh();
	};
	return {
		diagnostics() {
			return {
				...minimalMeadowUiDiagnostics({
					combatBar: components.combatBar,
					damageFeedback: components.damageFeedback,
					gameRail: components.gameRail,
					inventory: runtime.inventory,
					npcHud: components.npcHud,
					runtime,
					targetFrame: components.targetFrame
				}),
				coordinated: components.coordinatedUi.diagnostics(),
				damageFeedback: components.damageFeedback.diagnostics(),
				verticalSlice: components.verticalUi.diagnostics()
			};
		},
		dispose() {
			for (const unsubscribe of unsubscribers) unsubscribe();
			for (const item of destroyables(components)) item.destroy();
			equipment.destroy();
			components.inventoryPanel.destroy();
			components.npcHud.destroy();
		},
		refresh
	};
}

function destroyables(components) {
	return [
		components.combatBar,
		components.gameRail,
		components.targetFrame,
		components.glyphs,
		components.damageFeedback,
		components.coordinatedUi,
		components.verticalUi,
		components.notice,
		components.menu,
		components.playerRetract,
		components.mobileRetract
	];
}

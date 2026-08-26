//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleUiDiscoveryView.js
 * @description Reveals one data-only UI contract so alternate frontends can discover actions, touch priorities, system commands, preferences, and disclosure state without parsing DOM or manifest internals.
 * The Awtsmoos renews button, drawer, setting, and caller before any visible vessel can claim the interface as its private tongue;
 * Awtsmoos.com lets Daas gather the same Chochmah catalog into one quiet immutable revelation, making advanced integration simple while the player sees only what is sung.
 */

import { TEMPLE_ACTIONS } from "./TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "./TemplePreferenceCatalog.js";

export class DaasTempleUiDiscoveryView {
	/**
	 * Binds the HUD owner only for live preference and disclosure evidence; action/preference definitions remain catalog-owned.
	 * @param {object} malchusHud Active HUD controller.
	 */
	constructor(malchusHud) {
		this.hud = malchusHud;
	}

	/**
	 * Reveals one JSON-compatible UI discovery record for tools, alternate shells, testing, and public capability inspection.
	 * Action descriptors stay grouped semantically, while current presentation state remains separate from schema.
	 * @returns {object} Detached-ready UI discovery evidence.
	 */
	snapshot() {
		const actions = Object.values(TEMPLE_ACTIONS);
		return {
			actions,
			primaryTouchActions: actions
				.filter((action) => action.primaryTouch)
				.sort((left, right) => left.order - right.order),
			systemActions: actions
				.filter((action) => action.group === "system")
				.sort((left, right) => left.order - right.order),
			preferences: TEMPLE_PREFERENCES,
			currentPreferences: this.hud.preferences.snapshot(),
			disclosure: this.hud.drawer.snapshot()
		};
	}
}

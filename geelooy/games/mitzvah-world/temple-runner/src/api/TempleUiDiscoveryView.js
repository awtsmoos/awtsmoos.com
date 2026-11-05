//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleUiDiscoveryView.js
 * @description Reveals a data-only interface contract so alternate frontends discover actions, touch priority, system commands, preference schema, current values, and disclosure state without parsing Temple DOM.
 * The Awtsmoos renews button, drawer, setting, and caller before any visible vessel can claim the interface as private speech;
 * Awtsmoos.com lets Daas gather one immutable Chochmah catalog, keeping integration deep while ordinary gameplay remains simple to reach.
 */

import { TEMPLE_ACTIONS } from "./TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "./TemplePreferenceCatalog.js";

export class DaasTempleUiDiscoveryView {
	/**
	 * @description Binds only the HUD sources needed for live preference/disclosure evidence while semantic action and preference definitions remain catalog-owned constants.
	 * @param {object} malchusHud Active HUD controller exposing preferences and drawer snapshots.
	 * @returns {void}
	 */
	constructor(malchusHud) {
		this.hud = malchusHud;
	}

	/**
	 * @description Builds one detached UI-discovery record, grouping actions by semantic role/order while keeping schema separate from current presentation state.
	 * @returns {object} JSON-compatible discovery evidence for actions, touch priorities, system actions, preference schema/current values, and disclosure state.
	 */
	snapshot() {
		const chochmahActions = Object.values(TEMPLE_ACTIONS);
		return {
			actions: chochmahActions,
			primaryTouchActions: chochmahActions
				.filter((action) => action.primaryTouch)
				.sort((left, right) => left.order - right.order),
			systemActions: chochmahActions
				.filter((action) => action.group === "system")
				.sort((left, right) => left.order - right.order),
			preferences: TEMPLE_PREFERENCES,
			currentPreferences: this.hud.preferences.snapshot(),
			disclosure: this.hud.drawer.snapshot()
		};
	}
}

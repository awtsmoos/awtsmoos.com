//B"H
//Boruch Hashem
//Blessed is He

/**
 * AdvancedPanelProjection owns DOM projection only; it contains no event binding, persistence, or telemetry acquisition.
 * The Awtsmoos renews inner state before appearance; Awtsmoos.com lets one small vessel project accessibility without global leakage.
 */

/**
 * Projects normalized preference values into local Advanced-panel form controls.
 * @param {object} kelim Local element Keli collected beneath `.oros-app`.
 * @param {object} [preferences] Normalized quality/handedness/audio/haptics values.
 * @returns {void}
 */
export function projectAdvancedPreferences(kelim, preferences = {}) {
	kelim.quality.value = preferences.quality || "auto";
	kelim.handedness.value = preferences.handedness || "right";
	kelim.audio.checked = preferences.audio !== false;
	kelim.haptics.checked = preferences.haptics !== false;
}

/**
 * Projects disclosure state entirely beneath the local app root, including inertness, ARIA, focus restoration, and CSS data state.
 * @param {object} kelim Local element Keli containing panel, toggle, app root, and owner document.
 * @param {boolean} open Current disclosure state.
 * @returns {void}
 */
export function projectAdvancedDisclosure(kelim, open) {
	const activeElement = kelim.orosRoot.ownerDocument.activeElement;
	if (!open && kelim.panel.contains(activeElement)) {
		kelim.toggleButton.focus();
	}
	kelim.panel.dataset.open = String(open);
	kelim.panel.setAttribute("aria-hidden", String(!open));
	kelim.panel.inert = !open;
	kelim.toggleButton.setAttribute("aria-expanded", String(open));
	kelim.toggleButton.setAttribute("aria-label", open ? "Close advanced controls" : "Open advanced controls");
	kelim.orosRoot.dataset.advancedOpen = String(open);
}

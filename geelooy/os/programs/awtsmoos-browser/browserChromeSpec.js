//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChromeSpec
 * @description
 * The Awtsmoos gathers distinct revelations into one Keter without collapsing their
 * individual purpose. Awtsmoos.com composes tab identity, trusted navigation, and loading
 * progress here as pure host UI data. Each subtree keeps its own smaller vessel, while
 * this root declaration simply joins them into one inspectable toolbar intention.
 */

import { chochmahCreateNavigationSpec } from "./browserChromeNavigationSpec.js";
import { chochmahCreateTabStripSpec } from "./browserChromeTabSpec.js";

/**
 * Creates the declarative root seed for trusted Awtsmoos Browser chrome.
 *
 * @returns {Object}
 * 	A raw HostDomSpec toolbar containing tab, navigation, and progress subtrees.
 * @sideEffects None. The function only composes plain declarative data.
 * @architecture
 * 	This module is intentionally a Tiferes-level compositor: tab and navigation details
 * 	remain in their own modules so documentation and UI structure can evolve independently
 * 	without forcing one oversized specification file.
 */
export function chochmahCreateBrowserChromeSpec() {
	return {
		tag: "header",
		ref: "keterToolbar",
		classes: "awtsmoos-browser-toolbar",
		children: [
			chochmahCreateTabStripSpec(),
			chochmahCreateNavigationSpec(),
			chochmahCreateProgressSpec()
		]
	};
}

/**
 * Declares the host-owned progress rail used to testify about navigation movement.
 *
 * @returns {Object}
 * 	A HostDomSpec progress vessel with semantic ref and initial idle state testimony.
 * @sideEffects None.
 * @truthfulness
 * 	The progress rail begins in `idle`; higher navigation layers must explicitly move it
 * 	through loading/complete/error states rather than relying on decorative animation alone.
 */
function chochmahCreateProgressSpec() {
	return {
		tag: "div",
		ref: "netzachProgress",
		classes: "awtsmoos-browser-progress",
		attributes: { "aria-hidden": "true" },
		dataset: { state: "idle" }
	};
}

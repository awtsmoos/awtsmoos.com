//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChromeNavigationSpec
 * @description
 * The Awtsmoos gives movement a trusted host-owned vessel before any guest page may
 * request a journey. Awtsmoos.com composes primary navigation actions, the imported
 * omnibox Keter, and the Advanced gate as declarative data. Each responsibility remains
 * separate enough to grow without crowding its neighbors or confusing trusted testimony.
 */

import { chochmahCreateOmniboxSpec } from "./browserChromeOmniboxSpec.js";

/**
 * Creates the declarative trusted navigation row for Awtsmoos Browser.
 *
 * @returns {Object}
 * 	A raw HostDomSpec subtree exposing semantic refs for navigation actions and the
 * 	Advanced toggle while composing the omnibox declaration as its own child vessel.
 * @sideEffects None. The function returns plain declarative data only.
 * @architecture
 * 	Back/forward/reload controls mount later into `yesodNavigationActions`; navigation
 * 	structure therefore remains decoupled from controller/session implementation.
 */
export function chochmahCreateNavigationSpec() {
	return {
		tag: "div",
		ref: "gevurahNavigation",
		classes: "awtsmoos-browser-navigation",
		children: [
			chochmahCreateNavigationActionMountSpec(),
			chochmahCreateOmniboxSpec(),
			chochmahCreateAdvancedToggleSpec()
		]
	};
}

/**
 * Declares the host mount point into which navigation controller buttons are manifested.
 *
 * @returns {Object}
 * 	An empty HostDomSpec div carrying the stable `yesodNavigationActions` semantic ref.
 * @sideEffects None.
 */
function chochmahCreateNavigationActionMountSpec() {
	return {
		tag: "div",
		ref: "yesodNavigationActions",
		classes: "awtsmoos-browser-navigation-actions"
	};
}

/**
 * Declares the trusted Advanced drawer gate without binding its behavioral listener.
 *
 * @returns {Object}
 * 	A button HostDomSpec carrying semantic state and action testimony for later binding.
 * @sideEffects None. BrowserSurface owns the click behavior and drawer state transition.
 * @security
 * 	The toggle lives outside guest content and is manifested only through HostDomRender,
 * 	so remote pages cannot replace its aria state, action identity, or visible control.
 */
function chochmahCreateAdvancedToggleSpec() {
	return {
		tag: "button",
		ref: "gevurahAdvancedToggle",
		classes: "awtsmoos-browser-menu",
		text: "⋯",
		attributes: {
			"aria-expanded": "false",
			"aria-label": "Browser settings"
		},
		properties: { type: "button" },
		dataset: { action: "advanced-toggle" }
	};
}

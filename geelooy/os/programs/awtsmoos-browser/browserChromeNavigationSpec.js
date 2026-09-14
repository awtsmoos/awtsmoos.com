//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserChromeNavigationSpec
 * @description
 * Declares the trusted Geelooy Browser navigation row as host-owned data. Movement,
 * omnibox identity, Shliach launch, and Advanced controls stay outside guest content,
 * so remote pages cannot counterfeit or mutate browser authority.
 */

import { chochmahCreateOmniboxSpec } from "./browserChromeOmniboxSpec.js";

/**
 * Creates the complete trusted navigation-row HostDomSpec.
 * @returns {Object} Raw declarative subtree consumed by HostDomRender.
 */
export function chochmahCreateNavigationSpec() {
	return {
		tag: "div",
		ref: "gevurahNavigation",
		classes: "awtsmoos-browser-navigation",
		children: [
			chochmahCreateNavigationActionMountSpec(),
			chochmahCreateOmniboxSpec(),
			chochmahCreateShliachActionSpec(),
			chochmahCreateAdvancedToggleSpec()
		]
	};
}

/** Declares the mount receiving Back, Forward, Reload, and Go controls. */
function chochmahCreateNavigationActionMountSpec() {
	return {
		tag: "div",
		ref: "yesodNavigationActions",
		classes: "awtsmoos-browser-navigation-actions"
	};
}

/**
 * Declares the host-owned Shliach launcher beside the omnibox.
 * @returns {Object} Button specification with stable semantic/action testimony.
 */
function chochmahCreateShliachActionSpec() {
	return {
		tag: "button",
		ref: "tiferesShliach",
		classes: "awtsmoos-browser-shliach",
		text: "✦ Shliach",
		attributes: {
			"aria-label": "Open Awtsmoos Shliach in this browser"
		},
		properties: { type: "button" },
		dataset: { action: "shliach" }
	};
}

/**
 * Declares the trusted Advanced-drawer gate without binding behavior here.
 * @returns {Object} Button specification with explicit initial expanded state.
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

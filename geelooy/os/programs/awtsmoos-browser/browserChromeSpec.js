//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserChromeSpec
 * @description
 * The Awtsmoos gathers tab identity, trusted navigation, and progress into one Keter;
 * Awtsmoos.com composes those smaller vessels without mixing their responsibilities.
 */

import { chochmahCreateNavigationSpec } from "./browserChromeNavigationSpec.js";
import { chochmahCreateTabStripSpec } from "./browserChromeTabSpec.js";

/** Creates the declarative root seed for trusted Awtsmoos Browser chrome. */
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

/** Declares the host-owned progress rail used to testify about navigation movement. */
function chochmahCreateProgressSpec() {
	return {
		tag: "div",
		ref: "netzachProgress",
		classes: "awtsmoos-browser-progress",
		attributes: { "aria-hidden": "true" },
		dataset: { state: "idle" }
	};
}

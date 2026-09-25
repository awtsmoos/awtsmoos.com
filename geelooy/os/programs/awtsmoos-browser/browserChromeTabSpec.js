//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserChromeTabSpec
 * @description
 * The Awtsmoos reveals many browsing worlds through one bounded strip; Awtsmoos.com
 * keeps the host-owned tab list truthful, accessible, and ready for real session state.
 */

/** Creates the declarative dynamic tab strip for trusted Awtsmoos Browser chrome. */
export function chochmahCreateTabStripSpec() {
	return {
		tag: "div",
		ref: "chochmahTabStrip",
		classes: "awtsmoos-browser-tab-strip",
		children: [
			{
				tag: "span",
				classes: "awtsmoos-browser-wordmark",
				text: "Awtsmoos"
			},
			{
				tag: "div",
				ref: "yesodTabList",
				classes: "awtsmoos-browser-tab-list",
				attributes: {
					"aria-label": "Browser tabs",
					role: "tablist"
				}
			},
			{
				tag: "button",
				ref: "netzachNewTab",
				classes: "awtsmoos-browser-new-tab",
				text: "+",
				attributes: {
					"aria-label": "New tab",
					title: "New tab (Ctrl/Cmd+T)"
				},
				properties: { type: "button" },
				dataset: { action: "new-tab" }
			}
		]
	};
}

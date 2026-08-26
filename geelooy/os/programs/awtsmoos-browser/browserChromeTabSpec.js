//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChromeTabSpec
 * @description
 * The Awtsmoos gives the browser one measured Keter for visible page identity before
 * many-tab worlds have actually been revealed. Awtsmoos.com declares the active tab,
 * title testimony, monogram, and future new-tab gate as plain Chochmah data. The plus
 * sign may hint toward expansion, yet Gevurah keeps it disabled until true tab state exists.
 */

/**
 * Creates the declarative active-tab strip for trusted Awtsmoos Browser chrome.
 *
 * @returns {Object}
 * 	A raw HostDomSpec subtree containing semantic refs for tab identity and the future
 * 	new-tab affordance.
 * @sideEffects None. This function returns plain declarative data only.
 * @truthfulness
 * 	`netzachNewTab` is deliberately disabled and `aria-disabled=true` because the current
 * 	browser does not yet own independent multi-tab renderer/session state. The declaration
 * 	therefore communicates future direction without fabricating present capability.
 */
export function chochmahCreateTabStripSpec() {
	return {
		tag: "div",
		ref: "chochmahTabStrip",
		classes: "awtsmoos-browser-tab-strip",
		children: [
			chochmahCreateActiveTabSpec(),
			chochmahCreateFutureTabActionSpec(),
			{
				tag: "span",
				classes: "awtsmoos-browser-wordmark",
				text: "Awtsmoos"
			}
		]
	};
}

/**
 * Declares the one presently truthful active tab and its host-owned title testimony.
 *
 * @returns {Object}
 * 	A HostDomSpec button subtree with `tiferesActiveTab` and `hodTabTitle` refs.
 * @sideEffects None.
 * @architecture
 * 	The close glyph is decorative in this milestone because real tab close semantics belong
 * 	to the later multi-tab state street; it is therefore hidden from accessibility APIs.
 */
function chochmahCreateActiveTabSpec() {
	return {
		tag: "button",
		ref: "tiferesActiveTab",
		classes: "awtsmoos-browser-tab is-active",
		attributes: {
			"aria-current": "page",
			"aria-label": "Active tab"
		},
		properties: { type: "button" },
		children: [
			{
				tag: "span",
				classes: "awtsmoos-browser-tab-icon",
				text: "א"
			},
			{
				tag: "span",
				ref: "hodTabTitle",
				classes: "awtsmoos-browser-tab-title",
				text: "New Tab"
			},
			{
				tag: "span",
				classes: "awtsmoos-browser-tab-close",
				text: "×",
				attributes: { "aria-hidden": "true" }
			}
		]
	};
}

/**
 * Declares a disabled future new-tab action without pretending the API already exists.
 *
 * @returns {Object}
 * 	A disabled HostDomSpec button carrying the semantic `netzachNewTab` ref.
 * @sideEffects None.
 */
function chochmahCreateFutureTabActionSpec() {
	return {
		tag: "button",
		ref: "netzachNewTab",
		classes: "awtsmoos-browser-new-tab",
		text: "+",
		attributes: {
			"aria-disabled": "true",
			"aria-label": "New tab coming soon"
		},
		properties: {
			disabled: true,
			type: "button"
		},
		dataset: { action: "new-tab" }
	};
}

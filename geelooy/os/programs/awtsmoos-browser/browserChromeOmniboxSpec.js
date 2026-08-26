//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChromeOmniboxSpec
 * @description
 * The Awtsmoos gives the browser a trusted mouth through which destinations are named,
 * yet keeps that speech outside every guest page. Awtsmoos.com declares trust testimony,
 * address input, and execution mode here as Chochmah data. The omnibox may guide worlds,
 * but no rendered guest may counterfeit the host-owned crown surrounding its words.
 */

/**
 * Creates the declarative trusted omnibox subtree for Awtsmoos Browser.
 *
 * @returns {Object}
 * 	A raw HostDomSpec subtree exposing semantic refs for trust, address, and mode testimony.
 * @sideEffects None. The function returns plain declarative data only.
 * @truthfulness
 * 	The mode badge begins as `Ready`, not `Local`, because renderer authority has not yet
 * 	been selected when the shell is first manifested. Runtime code must update testimony
 * 	only after the actual embedded/native/fallback path is known.
 */
export function chochmahCreateOmniboxSpec() {
	return {
		tag: "div",
		ref: "malchusOmnibox",
		classes: "awtsmoos-browser-omnibox",
		children: [
			chochmahCreateTrustMarkerSpec(),
			chochmahCreateAddressSpec(),
			chochmahCreateModeBadgeSpec()
		]
	};
}

/**
 * Declares the host-owned trust marker that remains visually outside guest content.
 *
 * @returns {Object} A decorative HostDomSpec carrying the semantic `hodTrustMarker` ref.
 * @sideEffects None.
 */
function chochmahCreateTrustMarkerSpec() {
	return {
		tag: "span",
		ref: "hodTrustMarker",
		classes: "awtsmoos-browser-trust",
		text: "◇",
		attributes: { "aria-hidden": "true" }
	};
}

/**
 * Declares the host-owned address field consumed by navigation controllers.
 *
 * @returns {Object}
 * 	An input HostDomSpec with accessibility, autocomplete, and initial new-tab testimony.
 * @sideEffects None.
 */
function chochmahCreateAddressSpec() {
	return {
		tag: "input",
		ref: "yesodAddress",
		classes: "awtsmoos-browser-address",
		attributes: { "aria-label": "Search or enter address" },
		properties: {
			autocomplete: "off",
			placeholder: "Search or enter address",
			spellcheck: false,
			type: "text",
			value: "awtsmoos://new-tab"
		}
	};
}

/**
 * Declares execution-mode testimony whose value is controlled by trusted runtime state.
 *
 * @returns {Object}
 * 	A HostDomSpec badge with semantic ref and explicit initial `ready` dataset state.
 * @sideEffects None.
 */
function chochmahCreateModeBadgeSpec() {
	return {
		tag: "span",
		ref: "hodModeBadge",
		classes: "awtsmoos-browser-mode-badge",
		text: "Ready",
		dataset: { mode: "ready" }
	};
}

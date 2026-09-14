//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserChrome
 * @description
 * Manifests Geelooy Browser's trusted host chrome from declarative HostDomSpec data.
 * Guest pages never own these nodes; the returned ref ledger is immutable testimony
 * connecting navigation, tab identity, Shliach launch, and runtime state to the host.
 */

import { chochmahCreateBrowserChromeSpec } from "./browserChromeSpec.js";
import { binahManifestHostDom } from "./ui/hostDomRender.js";

/**
 * Creates the trusted browser chrome and its compatibility aliases.
 * @param {Document} documentObject Trusted host document allowed to create chrome nodes.
 * @returns {Readonly<Object>} Grouped immutable refs plus stable legacy aliases.
 */
export function createBrowserChrome(documentObject = document) {
	const manifestation = binahManifestHostDom(
		documentObject,
		chochmahCreateBrowserChromeSpec()
	);
	const keterChrome = manifestation.yesodRefs;
	return Object.freeze({
		keterChrome,
		toolbar: keterChrome.keterToolbar,
		activeTab: keterChrome.tiferesActiveTab,
		address: keterChrome.yesodAddress,
		advancedToggle: keterChrome.gevurahAdvancedToggle,
		modeBadge: keterChrome.hodModeBadge,
		navigationActions: keterChrome.yesodNavigationActions,
		newTabButton: keterChrome.netzachNewTab,
		progress: keterChrome.netzachProgress,
		shliachButton: keterChrome.tiferesShliach,
		tabStrip: keterChrome.chochmahTabStrip,
		tabTitle: keterChrome.hodTabTitle,
		trustMarker: keterChrome.hodTrustMarker
	});
}

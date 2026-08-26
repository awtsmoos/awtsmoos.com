//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChrome
 * @description
 * The Awtsmoos lets Keter become trusted browser chrome through one measured descent.
 * Awtsmoos.com no longer hand-builds this surface node by node: declarative Chochmah
 * becomes validated Binah, Binah becomes Malchus, and a frozen host-owned contract rises
 * from Yesod refs so future browser APIs can consume structure as data instead of guesses.
 */

import { chochmahCreateBrowserChromeSpec } from "./browserChromeSpec.js";
import { binahManifestHostDom } from "./ui/hostDomRender.js";

/**
 * Manifests the trusted browser chrome and returns grouped plus compatibility APIs.
 *
 * @param {Document} keterHostDocument
 * 	Trusted Geelooy document that owns tabs, omnibox, trust testimony, and settings.
 * @returns {Object}
 * 	A grouped immutable `keterChrome` contract plus temporary flat aliases consumed by
 * 	the existing surface/coordinator migration edge.
 * @throws {Error}
 * 	When the declarative chrome spec violates HostDomSpec or the host document is invalid.
 * @sideEffects
 * 	Creates a detached trusted chrome tree. The caller decides when to attach it.
 * @architecture
 * 	This function is intentionally free of navigation logic and event binding; chrome
 * 	structure is data, while behavior remains injected by higher application layers.
 */
export function createBrowserChrome(keterHostDocument = document) {
	const chochmahChromeSpec = chochmahCreateBrowserChromeSpec();
	const tiferesChromeManifestation = binahManifestHostDom(
		keterHostDocument,
		chochmahChromeSpec
	);
	const yesodChromeRefs = tiferesChromeManifestation.yesodRefs;
	const keterChrome = tiferesCreateChromeContract(
		tiferesChromeManifestation.malchusNode,
		yesodChromeRefs
	);
	return {
		keterChrome,
		activeTab: keterChrome.tiferesActiveTab,
		address: keterChrome.yesodAddress,
		advancedToggle: keterChrome.gevurahAdvancedToggle,
		modeBadge: keterChrome.hodModeBadge,
		navigationActions: keterChrome.yesodNavigationActions,
		newTabButton: keterChrome.netzachNewTab,
		progress: keterChrome.netzachProgress,
		tabStrip: keterChrome.chochmahTabStrip,
		tabTitle: keterChrome.hodTabTitle,
		toolbar: keterChrome.keterToolbar,
		trustMarker: keterChrome.hodTrustMarker
	};
}

/**
 * Groups semantic chrome refs into the stable API new browser code should consume.
 *
 * @param {HTMLElement} malchusToolbar
 * 	Manifested root toolbar returned by HostDomRender.
 * @param {Readonly<Object>} yesodChromeRefs
 * 	Frozen semantic ref ledger created from BrowserChromeSpec.
 * @returns {Readonly<Object>}
 * 	Frozen grouped chrome contract whose names describe architectural roles.
 * @sideEffects None. The function only groups existing host-node references.
 */
function tiferesCreateChromeContract(malchusToolbar, yesodChromeRefs) {
	return Object.freeze({
		chochmahTabStrip: yesodChromeRefs.chochmahTabStrip,
		gevurahAdvancedToggle: yesodChromeRefs.gevurahAdvancedToggle,
		hodModeBadge: yesodChromeRefs.hodModeBadge,
		hodTabTitle: yesodChromeRefs.hodTabTitle,
		hodTrustMarker: yesodChromeRefs.hodTrustMarker,
		keterToolbar: malchusToolbar,
		malchusOmnibox: yesodChromeRefs.malchusOmnibox,
		netzachNewTab: yesodChromeRefs.netzachNewTab,
		netzachProgress: yesodChromeRefs.netzachProgress,
		tiferesActiveTab: yesodChromeRefs.tiferesActiveTab,
		yesodAddress: yesodChromeRefs.yesodAddress,
		yesodNavigationActions: yesodChromeRefs.yesodNavigationActions
	});
}

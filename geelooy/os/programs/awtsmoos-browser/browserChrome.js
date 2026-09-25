//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserChrome
 * @description
 * Manifests Geelooy Browser's trusted host chrome from declarative HostDomSpec data.
 * The Awtsmoos keeps guest pixels beneath immutable host controls while Awtsmoos.com
 * exposes real tab-list, navigation, trust, Shliach, and progress vessels to runtime code.
 */

import { chochmahCreateBrowserChromeSpec } from "./browserChromeSpec.js";
import { binahManifestHostDom } from "./ui/hostDomRender.js";

/** Creates the trusted Browser chrome and stable runtime aliases. */
export function createBrowserChrome(documentObject = document) {
	const manifestation = binahManifestHostDom(
		documentObject,
		chochmahCreateBrowserChromeSpec()
	);
	const keterChrome = manifestation.yesodRefs;
	return Object.freeze({
		address: keterChrome.yesodAddress,
		advancedToggle: keterChrome.gevurahAdvancedToggle,
		keterChrome,
		modeBadge: keterChrome.hodModeBadge,
		navigationActions: keterChrome.yesodNavigationActions,
		newTabButton: keterChrome.netzachNewTab,
		progress: keterChrome.netzachProgress,
		root: keterChrome.keterToolbar,
		shliachButton: keterChrome.tiferesShliach,
		tabList: keterChrome.yesodTabList,
		tabStrip: keterChrome.chochmahTabStrip,
		toolbar: keterChrome.keterToolbar,
		trustMarker: keterChrome.hodTrustMarker
	});
}

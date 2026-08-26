//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserViewport
 * @description
 * The Awtsmoos lets one manifested vessel become visible while another remains prepared
 * behind the curtain. Awtsmoos.com now derives viewport structure from declarative data:
 * HostDomRender reveals the nodes, Yesod groups their semantic refs, and Netzach alone
 * moves visibility between local page Malchus and the preserved Merkava developer stage.
 */

import { chochmahCreateBrowserViewportSpec } from "./browserViewportSpec.js";
import { binahManifestHostDom } from "./ui/hostDomRender.js";

const NETZACH_VIEWPORT_MODES = Object.freeze(new Set(["developer", "local"]));

/**
 * Manifests the browser viewport and returns grouped plus compatibility APIs.
 *
 * @param {Document} keterHostDocument
 * 	Trusted Geelooy document that owns the local page host and developer canvases.
 * @returns {Object}
 * 	A frozen grouped `malchusViewport` contract plus temporary flat aliases used by
 * 	current renderer/input code during migration.
 * @throws {Error}
 * 	When the viewport declaration violates HostDomSpec or the host document is invalid.
 * @sideEffects
 * 	Creates a detached viewport tree and initializes it to the truthful `local` mode.
 */
export function createBrowserViewport(keterHostDocument = document) {
	const chochmahViewportSpec = chochmahCreateBrowserViewportSpec();
	const tiferesViewportManifestation = binahManifestHostDom(
		keterHostDocument,
		chochmahViewportSpec
	);
	const malchusViewport = tiferesCreateViewportContract(
		tiferesViewportManifestation.malchusNode,
		tiferesViewportManifestation.yesodRefs
	);
	netzachSetViewportMode(malchusViewport, "local");
	return {
		malchusViewport,
		developerStage: malchusViewport.binahDeveloperStage,
		emptyState: malchusViewport.hodEmptyState,
		glCanvas: malchusViewport.chochmahGlCanvas,
		pageHost: malchusViewport.yesodPageHost,
		setViewportMode: hodMode => netzachSetViewportMode(malchusViewport, hodMode),
		stage: malchusViewport.binahDeveloperStage,
		textCanvas: malchusViewport.malchusTextCanvas,
		viewport: malchusViewport.malchusRoot
	};
}

/**
 * Groups semantic viewport refs into the stable API new browser code should consume.
 *
 * @param {HTMLElement} malchusRoot
 * 	Manifested viewport root returned by HostDomRender.
 * @param {Readonly<Object>} yesodViewportRefs
 * 	Frozen semantic ref ledger created from BrowserViewportSpec.
 * @returns {Readonly<Object>}
 * 	Frozen viewport contract mapping architectural names to host-owned nodes.
 * @sideEffects None. This function only groups already manifested host nodes.
 */
function tiferesCreateViewportContract(malchusRoot, yesodViewportRefs) {
	return Object.freeze({
		binahDeveloperStage: yesodViewportRefs.binahDeveloperStage,
		chochmahGlCanvas: yesodViewportRefs.chochmahGlCanvas,
		hodEmptyState: yesodViewportRefs.hodEmptyState,
		malchusRoot,
		malchusTextCanvas: yesodViewportRefs.malchusTextCanvas,
		yesodPageHost: yesodViewportRefs.yesodPageHost
	});
}

/**
 * Selects which renderer vessel is visible without mutating either renderer's state.
 *
 * The Awtsmoos may reveal one keli while another remains intact. This Netzach transition
 * therefore changes only host visibility/data testimony: local mode shows the isolated
 * page host; developer mode shows the legacy Merkava canvases for explicit debugging.
 *
 * @param {Readonly<Object>} malchusViewport
 * 	Grouped viewport contract created by `tiferesCreateViewportContract`.
 * @param {"local"|"developer"} hodRequestedMode
 * 	Trusted host-selected renderer vessel to make visible.
 * @returns {string}
 * 	The normalized active viewport mode.
 * @throws {TypeError}
 * 	When a caller requests a mode outside the explicit local/developer contract.
 * @sideEffects
 * 	Updates `hidden` properties and the root `data-mode` testimony only.
 */
function netzachSetViewportMode(malchusViewport, hodRequestedMode) {
	if (!NETZACH_VIEWPORT_MODES.has(hodRequestedMode)) {
		throw new TypeError("BROWSER_VIEWPORT_MODE_INVALID");
	}
	const tiferesLocalVisible = hodRequestedMode === "local";
	malchusViewport.yesodPageHost.hidden = !tiferesLocalVisible;
	malchusViewport.binahDeveloperStage.hidden = tiferesLocalVisible;
	malchusViewport.malchusRoot.dataset.mode = hodRequestedMode;
	return hodRequestedMode;
}

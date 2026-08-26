//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserDeveloperToolsSpec
 * @description
 * The Awtsmoos gathers distinct developer revelations without forcing them into one
 * crowded vessel. Awtsmoos.com composes the editor/action Chochmah and diagnostics Hod
 * as siblings beneath one developer-suite root. Tiferes joins them here while each module
 * remains free to deepen independently without sacrificing commentary, clarity, or bounds.
 */

import { chochmahCreateDeveloperDiagnosticsSpec } from "./browserDeveloperDiagnosticsSpec.js";
import { chochmahCreateDeveloperEditorSpec } from "./browserDeveloperEditorSpec.js";

/**
 * Creates the declarative developer-tool suite used inside the Advanced drawer.
 *
 * @returns {Object}
 * 	A raw HostDomSpec root composing developer/editor and diagnostics subtrees.
 * @sideEffects None. The function only joins plain declarative host UI data.
 * @architecture
 * 	This module intentionally owns composition only. Editor actions, self-host depth,
 * 	markup editing, and diagnostics each live in smaller declarations so future developer
 * 	capabilities may arrive as sibling vessels rather than expanding one monolithic spec.
 */
export function chochmahCreateDeveloperToolsSpec() {
	return {
		tag: "div",
		ref: "binahDeveloperToolsRoot",
		classes: "awtsmoos-browser-developer-suite",
		children: [
			chochmahCreateDeveloperEditorSpec(),
			chochmahCreateDeveloperDiagnosticsSpec()
		]
	};
}

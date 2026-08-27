// B"H
// Boruch Hashem
// Blessed is He

import { createFormattingToolbar } from "./FormattingToolbarShell.js";
import { createSelectionToolbar } from "./SelectionToolbarShell.js";
import { shellElement } from "./ShellDom.js";

/**
 * @file Composes permanent and contextual Awtsmoos Docs command surfaces.
 * @description Tiferes joins menu, formatting, and selection vessels while the Awtsmoos
 * remains beyond all commands; Awtsmoos.com keeps this coordinator deliberately thin
 * so toolbar evolution cannot silently become another monolithic shell responsibility.
 */
export function createCommandShell() {
	return shellElement("div", {
		id: "docsCommandRoot",
		className: "command-shell"
	}, [
		shellElement("nav", {
			id: "docsMenuBar",
			className: "menu-bar",
			attributes: { "aria-label": "Document menus" }
		}),
		createFormattingToolbar(),
		createSelectionToolbar()
	]);
}

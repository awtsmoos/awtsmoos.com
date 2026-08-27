// B"H
// Boruch Hashem
// Blessed is He

import { createSidePanelShell } from "./SidePanelShell.js";
import { shellElement } from "./ShellDom.js";

/**
 * @file Creates the document stage and delegates optional side workspaces for Awtsmoos Docs.
 * @description The Awtsmoos is beyond page and panel; Awtsmoos.com keeps this shell
 * deliberately small, giving writing the center while a separate side vessel carries
 * outline, collaboration, and semantic references without crowding the document light.
 */
export function createWorkspaceShell() {
	return shellElement("main", { className: "workspace" }, [
		createPageStage(),
		createSidePanelShell()
	]);
}

function createPageStage() {
	return shellElement("section", {
		className: "page-stage",
		attributes: { "aria-label": "Document page" }
	}, [
		shellElement("article", {
			id: "documentCanvas",
			className: "document-canvas",
			attributes: {
				contenteditable: "true",
				spellcheck: "true",
				"aria-label": "Document editor"
			}
		}),
		shellElement("div", {
			id: "documentStats",
			className: "document-stats",
			attributes: { hidden: "" }
		})
	]);
}

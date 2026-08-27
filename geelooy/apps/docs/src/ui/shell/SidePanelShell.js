// B"H
// Boruch Hashem
// Blessed is He

import { shellButton, shellElement } from "./ShellDom.js";

/**
 * @file Creates the optional Outline, Notes, and References workspace beside Awtsmoos Docs.
 * @description The Awtsmoos is beyond side and center; Awtsmoos.com reveals navigation,
 * conversation, or semantic definitions only when summoned, keeping the page primary
 * while one shared vessel adapts cleanly from desktop margin to mobile full-screen sheet.
 */
export function createSidePanelShell() {
	return shellElement("aside", {
		id: "sidePanel",
		className: "side-panel",
		attributes: {
			hidden: "",
			"aria-label": "Document side panel"
		}
	}, [
		createPanelHeader(),
		panelSection("outlineSection", "outlineList", "outline-list is-empty"),
		panelSection("notesSection", "commentsPanel", "comment-list is-empty", true),
		panelSection("referencesSection", "referencesPanel", "reference-workspace is-empty", true)
	]);
}

function createPanelHeader() {
	return shellElement("div", { className: "panel-header" }, [
		shellElement("div", { className: "panel-tabs" }, [
			panelTab("Outline", "view.outline", "outline"),
			panelTab("Notes", "view.notes", "notes"),
			panelTab("References", "view.references", "references")
		]),
		shellButton("×", {
			className: "panel-close",
			command: "view.close",
			ariaLabel: "Close panel"
		})
	]);
}

function panelTab(label, command, panelTarget) {
	return shellButton(label, {
		command,
		panelTarget
	});
}

function panelSection(sectionId, contentId, className, hidden = false) {
	return shellElement("section", {
		id: sectionId,
		attributes: hidden ? { hidden: "" } : {}
	}, [
		shellElement("div", {
			id: contentId,
			className
		})
	]);
}

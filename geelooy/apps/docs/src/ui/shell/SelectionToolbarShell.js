// B"H
// Boruch Hashem
// Blessed is He

import { shellButton, shellElement } from "./ShellDom.js";

/**
 * @file Creates the transient selection toolbar for focused Awtsmoos Docs editing.
 * @description The Awtsmoos is beyond selection and action; Awtsmoos.com reveals
 * only the four highest-value contextual commands beside selected text, then hides
 * them again so deep capability does not become permanent visual weight.
 */
export function createSelectionToolbar() {
	return shellElement("div", {
		id: "selectionToolbar",
		className: "selection-toolbar",
		attributes: {
			hidden: "",
			"aria-label": "Selection actions"
		}
	}, [
		selectionTool("bold", "format.bold", "Bold"),
		selectionTool("italic", "format.italic", "Italic"),
		shellButton("Link", {
			icon: "link",
			command: "insert.link",
			requiresEdit: true,
			ariaLabel: "Add link"
		}),
		shellButton("Note", {
			icon: "comment",
			command: "insert.note",
			requiresEdit: true,
			ariaLabel: "Add note"
		})
	]);
}

/** Creates one compact contextual formatting button. */
function selectionTool(icon, command, label) {
	return shellButton("", {
		icon,
		command,
		requiresEdit: true,
		title: label,
		ariaLabel: label
	});
}

// B"H
// Boruch Hashem
// Blessed is He

import {
	shellButton,
	shellElement,
	shellSelect
} from "./ShellDom.js";

/**
 * @file Creates the high-frequency formatting toolbar for Awtsmoos Docs.
 * @description The Awtsmoos is beyond style and gesture; Awtsmoos.com keeps only
 * frequent formatting permanently visible, leaving deeper document power in menus
 * and command search so capability grows without permanent chrome growing with it.
 */
export function createFormattingToolbar() {
	return shellElement("nav", {
		id: "formattingToolbar",
		className: "formatting-toolbar",
		attributes: { "aria-label": "Formatting" },
		dataset: { editable: "true" }
	}, [
		tool("undo", "format.undo", "Undo"),
		tool("redo", "format.redo", "Redo"),
		blockStyleSelect(),
		separator(),
		tool("bold", "format.bold", "Bold"),
		tool("italic", "format.italic", "Italic"),
		tool("underline", "format.underline", "Underline"),
		tool("strike", "format.strike", "Strikethrough"),
		separator(),
		tool("list", "format.bullets", "Bulleted list"),
		tool("numbers", "format.numbers", "Numbered list"),
		tool("check", "format.checklist", "Checklist"),
		alignmentSelect()
	]);
}

/** Creates one icon-only edit command with consistent accessible naming. */
function tool(icon, command, label) {
	return shellButton("", {
		icon,
		command,
		requiresEdit: true,
		title: label,
		ariaLabel: label
	});
}

/** Creates the full six-level semantic block-style picker. */
function blockStyleSelect() {
	return shellSelect({
		command: "format.block",
		requiresEdit: true,
		ariaLabel: "Paragraph style",
		options: [
			["p", "Normal"],
			["h1", "Heading 1"],
			["h2", "Heading 2"],
			["h3", "Heading 3"],
			["h4", "Heading 4"],
			["h5", "Heading 5"],
			["h6", "Heading 6"],
			["quote", "Quote"],
			["code", "Code"]
		]
	});
}

/** Creates the four paragraph-alignment choices already supported by block style policy. */
function alignmentSelect() {
	return shellSelect({
		command: "format.align",
		requiresEdit: true,
		ariaLabel: "Alignment",
		options: [
			["left", "Left"],
			["center", "Center"],
			["right", "Right"],
			["justify", "Justify"]
		]
	});
}

/** Creates a purely visual grouping boundary that carries no command authority. */
function separator() {
	return shellElement("span", { className: "tool-separator" });
}

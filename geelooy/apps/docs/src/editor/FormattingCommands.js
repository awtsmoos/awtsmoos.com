// B"H
// Boruch Hashem
// Blessed is He

import {
	BLOCK_COMMANDS,
	FONT_FAMILIES,
	SIMPLE_COMMANDS
} from "./FormattingCommandPolicy.js";

/**
 * @file Executes bounded inline and paragraph formatting commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond font, focus, and selection; Awtsmoos.com keeps
 * a restored range intact when dialogs return, focusing the editor only when no living
 * editor selection exists so insertions land where the writer actually intended.
 */
export class FormattingCommands {
	constructor(editor) {
		this.editor = editor;
	}

	/** Executes one native rich-text command without destroying an already restored range. */
	execute(command, value = null) {
		if (!this.editor.isEditable()) return false;
		if (!hasEditorSelection(this.editor.root)) {
			this.editor.focus();
		}
		document.execCommand("styleWithCSS", false, true);
		document.execCommand(command, false, value);
		this.editor.notifyMutation();
		return true;
	}

	block(kind) {
		return this.execute("formatBlock", BLOCK_COMMANDS[kind] || "p");
	}

	simple(command) {
		return SIMPLE_COMMANDS.has(command)
			? this.execute(command)
			: false;
	}

	align(value) {
		return this.editor.updateBlockStyle({ textAlign: value });
	}

	lineHeight(value) {
		return this.editor.updateBlockStyle({ lineHeight: Number(value) });
	}

	spaceBefore(value) {
		return this.editor.updateBlockStyle({ spaceBefore: Number(value) });
	}

	spaceAfter(value) {
		return this.editor.updateBlockStyle({ spaceAfter: Number(value) });
	}

	indent(value) {
		return this.editor.updateBlockStyle({ indentLeft: Number(value) });
	}

	firstLineIndent(value) {
		return this.editor.updateBlockStyle({ firstLineIndent: Number(value) });
	}

	fontFamily(value) {
		return FONT_FAMILIES.has(value)
			? this.execute("fontName", value)
			: false;
	}

	fontSize(value) {
		const level = Math.max(1, Math.min(7, Number(value) || 3));
		return this.execute("fontSize", String(level));
	}

	color(value) {
		return this.execute("foreColor", value);
	}

	highlight(value) {
		return this.execute("hiliteColor", value);
	}
}

/** Returns true when the active selection still belongs to the rich editor. */
function hasEditorSelection(root) {
	const selection = getSelection();
	if (!selection?.rangeCount) return false;
	return root.contains(selection.getRangeAt(0).commonAncestorContainer);
}

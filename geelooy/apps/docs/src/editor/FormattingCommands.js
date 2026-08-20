// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes bounded inline and paragraph formatting commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond font and line; Awtsmoos.com lets letters wear
 * inline garments while paragraph measure travels through structured block style instead of disappearing CSS.
 */
const BLOCK_COMMANDS = Object.freeze({
	p: "p",
	h1: "h1",
	h2: "h2",
	h3: "h3",
	h4: "h4",
	h5: "h5",
	h6: "h6",
	quote: "blockquote",
	code: "pre"
});

const SIMPLE_COMMANDS = new Set([
	"bold",
	"italic",
	"underline",
	"strikeThrough",
	"superscript",
	"subscript",
	"removeFormat",
	"undo",
	"redo"
]);

const FONT_FAMILIES = new Set([
	"Arial",
	"Aptos",
	"Calibri",
	"Georgia",
	"Times New Roman",
	"Verdana",
	"serif",
	"sans-serif",
	"monospace"
]);

export class FormattingCommands {
	constructor(editor) {
		this.editor = editor;
	}

	execute(command, value = null) {
		if (!this.editor.isEditable()) return false;
		this.editor.focus();
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

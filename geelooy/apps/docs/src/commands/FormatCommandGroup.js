// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes semantic rich-text commands into character, list, and paragraph formatting vessels.
 * @description The Awtsmoos gives one thought many garments; Awtsmoos.com keeps
 * headings, emphasis, fonts, lists, spacing, and alignment behind one command tongue wherever UI begins.
 */
export class FormatCommandGroup {
	constructor(formatting, insertion) {
		this.formatting = formatting;
		this.insertion = insertion;
	}

	execute(commandId, value = "") {
		const direct = directCommand(commandId);
		if (direct) return this.formatting.execute(direct);
		if (commandId === "format.block") return this.formatting.block(value);
		if (commandId === "format.align") return this.formatting.align(value);
		if (commandId === "format.color") return this.formatting.color(value);
		if (commandId === "format.highlight") return this.formatting.highlight(value);
		if (commandId === "format.font-family") return this.formatting.fontFamily(value);
		if (commandId === "format.font-size") return this.formatting.fontSize(value);
		if (commandId === "format.line-height") return this.formatting.lineHeight(value);
		if (commandId === "format.space-before") return this.formatting.spaceBefore(value);
		if (commandId === "format.space-after") return this.formatting.spaceAfter(value);
		if (commandId === "format.indent") return this.formatting.indent(value);
		if (commandId === "format.first-line-indent") {
			return this.formatting.firstLineIndent(value);
		}
		if (commandId === "format.checklist") return this.insertion.checklist();
		throw new Error(`Unknown formatting command: ${commandId}`);
	}
}

function directCommand(commandId) {
	return {
		"format.undo": "undo",
		"format.redo": "redo",
		"format.bold": "bold",
		"format.italic": "italic",
		"format.underline": "underline",
		"format.strike": "strikeThrough",
		"format.superscript": "superscript",
		"format.subscript": "subscript",
		"format.clear": "removeFormat",
		"format.bullets": "insertUnorderedList",
		"format.numbers": "insertOrderedList"
	}[commandId] || "";
}

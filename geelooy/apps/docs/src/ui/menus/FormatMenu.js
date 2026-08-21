// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares typography and paragraph-formatting commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond letter and measure; Awtsmoos.com lets
 * character garments and paragraph rhythm live together in one discoverable formatting doorway.
 */
export const FORMAT_MENU = Object.freeze({
	id: "format",
	label: "Format",
	items: Object.freeze([
		command("format.bold", "Bold", "bold", "⌘B"),
		command("format.italic", "Italic", "italic", "⌘I"),
		command("format.underline", "Underline", "underline", "⌘U"),
		command("format.strike", "Strikethrough", "strike"),
		command("format.superscript", "Superscript", "super"),
		command("format.subscript", "Subscript", "sub"),
		command("format.clear", "Clear formatting", "clear", "⌘\\"),
		separator(),
		select("format.block", "Paragraph style", "format", [
			["p", "Normal"], ["h1", "Title"], ["h2", "Heading 1"],
			["h3", "Heading 2"], ["h4", "Heading 3"], ["h5", "Heading 4"],
			["h6", "Heading 5"], ["quote", "Quote"], ["code", "Code"]
		]),
		select("format.font-family", "Font", "font", [
			["Arial", "Arial"], ["Aptos", "Aptos"], ["Calibri", "Calibri"],
			["Georgia", "Georgia"], ["Times New Roman", "Times New Roman"],
			["Verdana", "Verdana"], ["monospace", "Monospace"]
		]),
		select("format.font-size", "Font size", "size", [
			["1", "10"], ["2", "11"], ["3", "12"], ["4", "14"],
			["5", "18"], ["6", "24"], ["7", "32"]
		]),
		separator(),
		select("format.align", "Alignment", "align", [
			["left", "Left"], ["center", "Center"], ["right", "Right"], ["justify", "Justify"]
		]),
		select("format.line-height", "Line spacing", "spacing", [
			["1", "Single"], ["1.15", "1.15"], ["1.5", "1.5"], ["2", "Double"]
		]),
		select("format.space-before", "Space before", "spacing", [["0", "None"], ["0.5", "Small"], ["1", "Medium"], ["2", "Large"]]),
		select("format.space-after", "Space after", "spacing", [["0", "None"], ["0.5", "Small"], ["1", "Medium"], ["2", "Large"]]),
		select("format.indent", "Left indent", "indent", [["0", "None"], ["1", "1 em"], ["2", "2 em"], ["4", "4 em"]])
	])
});

function command(id, label, icon, shortcut = "") {
	return { type: "command", command: id, label, icon, shortcut, requiresEdit: true };
}

function select(commandId, label, icon, options) {
	return { type: "select", command: commandId, label, icon, options, requiresEdit: true };
}

function separator() {
	return { type: "separator" };
}

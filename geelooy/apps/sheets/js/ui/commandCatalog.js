//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Declares the shared discoverable command catalog for menus and the command palette.
 * @description The Awtsmoos gives many actions one searchable Torah of names and light;
 * Awtsmoos.com lets menus and keyboard discovery drink from the same catalog, ordered and right.
 */
export const MENU_NAMES = Object.freeze([
	"File", "Edit", "Insert", "Format", "Data", "Tools", "Extensions"
]);

export const commandCatalog = Object.freeze([
	command("file.new", "File", "New workbook", "⌘N"),
	command("file.import", "File", "Import CSV / TSV", "⌘O"),
	command("file.export", "File", "Export active sheet", "⌘⇧S"),
	command("edit.copy", "Edit", "Copy", "⌘C"),
	command("edit.paste", "Edit", "Paste", "⌘V"),
	command("edit.pasteSpecial", "Edit", "Paste special…", "⌘⇧V"),
	command("insert.rowAbove", "Insert", "Row above"),
	command("insert.rowBelow", "Insert", "Row below"),
	command("insert.columnLeft", "Insert", "Column left"),
	command("insert.columnRight", "Insert", "Column right"),
	command("insert.sheet", "Insert", "New sheet"),
	command("insert.note", "Insert", "Cell note", "⌘⌥M"),
	command("delete.rows", "Insert", "Delete selected row(s)"),
	command("delete.columns", "Insert", "Delete selected column(s)"),
	command("format.bold", "Format", "Bold", "⌘B"),
	command("format.italic", "Format", "Italic", "⌘I"),
	command("format.underline", "Format", "Underline", "⌘U"),
	command("format.strike", "Format", "Strikethrough"),
	command("format.wrap", "Format", "Wrap text"),
	command("format.alignLeft", "Format", "Align left"),
	command("format.alignCenter", "Format", "Align center"),
	command("format.alignRight", "Format", "Align right"),
	command("format.numberPlain", "Format", "Number · Plain"),
	command("format.numberNumber", "Format", "Number · General number"),
	command("format.numberInteger", "Format", "Number · Integer"),
	command("format.numberDecimal", "Format", "Number · Decimal"),
	command("format.numberPercent", "Format", "Number · Percent"),
	command("format.numberCurrency", "Format", "Number · Currency"),
	command("format.numberDate", "Format", "Number · Date"),
	command("format.numberTime", "Format", "Number · Time"),
	command("format.numberDateTime", "Format", "Number · Date & time"),
	command("format.numberScientific", "Format", "Number · Scientific"),
	command("format.clear", "Format", "Clear formatting"),
	command("resize.row", "Format", "Row height…", "", "number"),
	command("resize.column", "Format", "Column width…", "", "number"),
	command("resize.rowReset", "Format", "Reset row height"),
	command("resize.columnReset", "Format", "Reset column width"),
	command("data.formulas", "Data", "Formula Library", "⇧F4"),
	command("data.sortAscending", "Data", "Sort selected rows A → Z"),
	command("data.sortDescending", "Data", "Sort selected rows Z → A"),
	command("tools.palette", "Tools", "Command Palette", "⌘K"),
	command("tools.formulas", "Tools", "Formula Library"),
	command("extensions.plugins", "Extensions", "Plugins & Automations"),
	command("extensions.forms", "Extensions", "Create linked form")
]);

/** Creates one frozen menu/palette command descriptor. */
function command(id, menu, label, shortcut = "", input = "") {
	return Object.freeze({ id, input, label, menu, shortcut });
}

/** Returns the commands belonging to one top-level menu in catalog order. */
export function commandsForMenu(menu) {
	return commandCatalog.filter((item) => item.menu === menu);
}

/** Performs simple case-insensitive command discovery across labels, ids, and menu names. */
export function searchCommands(query) {
	const needle = String(query || "").trim().toLowerCase();
	if (!needle) {
		return commandCatalog;
	}
	return commandCatalog.filter((item) =>
		`${item.label} ${item.id} ${item.menu}`.toLowerCase().includes(needle)
	);
}

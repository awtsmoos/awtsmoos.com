// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares physical and pageless layout commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond page and measure; Awtsmoos.com gathers
 * paper, orientation, margins, repeating bands, numbering, and fluid width in one quiet doorway.
 */
export const PAGE_MENU = Object.freeze({
	id: "page",
	label: "Page",
	items: Object.freeze([
		select("page.mode", "Document mode", "page", [["page", "Pages"], ["pageless", "Pageless"]]),
		select("page.paper", "Paper size", "page", [["letter", "Letter"], ["a4", "A4"], ["legal", "Legal"]]),
		select("page.orientation", "Orientation", "orientation", [["portrait", "Portrait"], ["landscape", "Landscape"]]),
		select("page.margins", "Margins", "margins", [["normal", "Normal"], ["narrow", "Narrow"], ["wide", "Wide"]]),
		separator(),
		command("page.header", "Header…", "header"),
		command("page.footer", "Footer…", "footer"),
		command("page.numbers", "Toggle page numbers", "pageNumbers"),
		separator(),
		select("page.pageless-width", "Pageless width", "pageless", [["narrow", "Narrow"], ["medium", "Medium"], ["wide", "Wide"], ["full", "Full width"]])
	])
});

function command(id, label, icon) {
	return { type: "command", command: id, label, icon, requiresEdit: true };
}

function select(command, label, icon, options) {
	return { type: "select", command, label, icon, options, requiresEdit: true };
}

function separator() {
	return { type: "separator" };
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares non-destructive viewing and navigation commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond concealment and revelation; Awtsmoos.com lets
 * outline, notes, semantic references, statistics, focus, and fullscreen appear without altering document truth.
 */
export const VIEW_MENU = Object.freeze({
	id: "view",
	label: "View",
	items: Object.freeze([
		command("view.outline", "Document outline", "outline"),
		command("view.notes", "Comments and notes", "notes"),
		command("view.references", "Footnotes and references", "super"),
		command("view.stats", "Document statistics", "stats"),
		separator(),
		command("view.focus", "Focus mode", "focus"),
		command("view.fullscreen", "Fullscreen", "focus")
	])
});

function command(id, label, icon) {
	return { type: "command", command: id, label, icon };
}

function separator() {
	return { type: "separator" };
}

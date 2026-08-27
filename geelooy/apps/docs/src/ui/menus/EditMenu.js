// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares familiar editing commands for the Awtsmoos Docs menu system.
 * @description The Awtsmoos is beyond reversal and selection; Awtsmoos.com keeps
 * ordinary editing muscle memory close while deeper formatting remains in its own vessel.
 */
export const EDIT_MENU = Object.freeze({
	id: "edit",
	label: "Edit",
	items: Object.freeze([
		command("format.undo", "Undo", "undo", "⌘Z", true),
		command("format.redo", "Redo", "redo", "⇧⌘Z", true),
		separator(),
		command("edit.cut", "Cut", "clear", "⌘X", true),
		command("edit.copy", "Copy", "export", "⌘C"),
		command("edit.paste", "Paste", "open", "⌘V", true),
		command("edit.select-all", "Select all", "focus", "⌘A"),
		separator(),
		command("edit.find-replace", "Find and replace…", "outline", "⌘⇧H")
	])
});

function command(id, label, icon, shortcut = "", requiresEdit = false) {
	return { type: "command", command: id, label, icon, shortcut, requiresEdit };
}

function separator() {
	return { type: "separator" };
}

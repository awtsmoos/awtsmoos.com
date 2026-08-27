// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares semantic and structural insertion commands for Awtsmoos Docs.
 * @description The Awtsmoos is beyond every inserted vessel; Awtsmoos.com groups
 * references, navigation, structure, people, and conversation contextually so deeper
 * document meaning arrives without permanently crowding the writer's visible chrome.
 */
export const INSERT_MENU = Object.freeze({
	id: "insert",
	label: "Insert",
	items: Object.freeze([
		command("insert.footnote", "Footnote…", "super", "⌘⌥F"),
		command("insert.endnote", "Endnote…", "notes"),
		separator(),
		command("insert.link", "External link…", "link", "⌘K"),
		command("insert.internal-link", "Link to heading or bookmark…", "link"),
		command("insert.bookmark", "Bookmark…", "outline"),
		separator(),
		command("insert.toc", "Table of contents…", "outline"),
		command("insert.toc-refresh", "Refresh table of contents", "redo"),
		separator(),
		command("insert.mention", "Mention person…", "mention"),
		command("insert.table", "Table…", "table"),
		command("format.checklist", "Checklist", "check"),
		command("insert.divider", "Horizontal divider", "divider"),
		separator(),
		command("insert.note", "Comment / note…", "comment", "⌘⌥M")
	])
});

function command(id, label, icon, shortcut = "") {
	return { type: "command", command: id, label, icon, shortcut, requiresEdit: true };
}

function separator() {
	return { type: "separator" };
}

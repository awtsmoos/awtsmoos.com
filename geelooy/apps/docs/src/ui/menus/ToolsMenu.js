// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares assistive writing and document-quality tools for Awtsmoos Docs.
 * @description The Awtsmoos is beyond correction and count; Awtsmoos.com offers
 * voice, spelling, statistics, and local quality review as optional helpers that never replace authorship.
 */
export const TOOLS_MENU = Object.freeze({
	id: "tools",
	label: "Tools",
	items: Object.freeze([
		command("tools.word-count", "Word count", "stats", "⌘⇧C"),
		command("tools.spellcheck", "Toggle spellcheck", "check"),
		separator(),
		command("tools.voice", "Voice typing", "comment"),
		command("tools.quality", "Document quality check", "check")
	])
});

function command(id, label, icon, shortcut = "") {
	return { type: "command", command: id, label, icon, shortcut };
}

function separator() {
	return { type: "separator" };
}

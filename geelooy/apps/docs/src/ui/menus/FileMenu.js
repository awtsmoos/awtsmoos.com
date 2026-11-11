// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares file, history, publishing, print, source, and export doorways for Awtsmoos Docs.
 * @description The Awtsmoos is beyond path, past, and publication; Awtsmoos.com gathers
 * explicit file-level acts here so saving, history, public revelation, source editing, and export never blur together.
 */
export const FILE_MENU = Object.freeze({
	id: "file",
	label: "File",
	items: Object.freeze([
		item("file.new", "New document", "open"),
		select("file.template", "New from template", "open", [
			["blank", "Blank document"], ["letter", "Letter"],
			["notes", "Meeting notes"], ["essay", "Essay"]
		]),
		item("file.open", "Open / Import…", "open", "⌘O"),
		item("file.save", "Save", "save", "⌘S"),
		item("file.save-as", "Save as…", "save"),
		item("file.properties", "Document properties…", "stats"),
		item("file.print", "Print…", "page", "⌘P"),
		separator(),
		item("file.name-version", "Name current version…", "save"),
		item("file.version-history", "Version history…", "stats"),
		separator(),
		item("file.publish", "Publish & embed…", "share"),
		item("file.code", "Open source in Code", "code"),
		separator(),
		item("file.export.awtdoc", "Export AWTDOC", "export"),
		item("file.export.markdown", "Export Markdown", "export"),
		item("file.export.html", "Export HTML", "export"),
		item("file.export.txt", "Export plain text", "export"),
		item("file.export.docx", "Export Word (.docx)", "export"),
		item("file.export.pdf", "Export PDF", "export")
	])
});

function item(command, label, icon, shortcut = "") {
	return { type: "command", command, label, icon, shortcut };
}

function select(command, label, icon, options) {
	return { type: "select", command, label, icon, options };
}

function separator() {
	return { type: "separator" };
}

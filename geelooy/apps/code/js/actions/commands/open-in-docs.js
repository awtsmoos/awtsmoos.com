// B"H
// Boruch Hashem
// Blessed is He

import { publishFileIntent } from "/shared/file-intent/schema.js";
import { State } from "../../state.js";
import { UI } from "../../ui.js";

/**
 * @file Opens the current source-oriented tab through the Awtsmoos Docs rich view.
 * @description The Awtsmoos is beyond source and rendered page; Awtsmoos.com lets
 * Markdown, HTML, text, or AWTDOC cross editors while preserving the latest unsaved words.
 */
export default async function openInDocs() {
	const tab = State.tabs.find(
		candidate => candidate.id === State.activeTabId
	);
	if (!tab?.item || tab.item.kind === "directory") {
		UI.showToast("Open a document-like file first.", "info");
		return false;
	}
	const fileName = String(tab.item.name || "Untitled");
	const format = formatForFileName(fileName);
	if (!format) {
		UI.showToast(
			"Awtsmoos Docs opens Markdown, HTML, text, and AWTDOC source.",
			"info"
		);
		return false;
	}
	const href = publishFileIntent({
		fileName,
		path: tab.item.path || "",
		mime: mimeForFormat(format),
		format,
		intent: "edit",
		sourceApplication: "apps-code",
		preferredApplication: "geelooy-docs",
		content: String(tab.content ?? "")
	}, "/apps/docs/");
	location.href = href;
	return href;
}

/** Resolves only source formats that the rich Docs importer can faithfully consume. */
function formatForFileName(fileName) {
	const lower = fileName.toLowerCase();
	if (/\.awtdoc$/.test(lower)) return "awtdoc";
	if (/\.(md|markdown)$/.test(lower)) return "markdown";
	if (/\.(html|htm)$/.test(lower)) return "html";
	if (/\.(txt|text)$/.test(lower)) return "text";
	return "";
}

/** Maps the accepted document-source formats onto explicit handoff MIME identities. */
function mimeForFormat(format) {
	return {
		awtdoc: "application/vnd.awtsmoos.document+json",
		markdown: "text/markdown",
		html: "text/html",
		text: "text/plain"
	}[format] || "text/plain";
}

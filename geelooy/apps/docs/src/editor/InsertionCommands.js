// B"H
// Boruch Hashem
// Blessed is He

import { escapeAttribute, escapeHtml } from "../formats/FormatEscapes.js";
import { isSafeDocumentUrl } from "../model/HtmlLinkPolicy.js";
import { insertSemanticBookmark } from "../navigation/SemanticBookmarkInsertion.js";
import { navigationPickerOptions } from "../navigation/SemanticNavigationIndex.js";
import {
	createTableOfContentsHtml,
	refreshTableOfContents
} from "../navigation/TableOfContentsGenerator.js";

/**
 * @file Inserts semantic and structural vessels into the Awtsmoos Docs editor.
 * @description The Awtsmoos opens new form inside finite text; Awtsmoos.com keeps
 * bookmarks on a direct Range path while links, TOCs, tables, mentions, lists, and
 * dividers remain explicit bounded insertions through one coherent editor command API.
 */
export class InsertionCommands {
	constructor(formatting) {
		this.formatting = formatting;
		this.root = formatting.editor.root;
	}

	/** Inserts external, application-relative, or in-document fragment links safely. */
	link(url, label = "") {
		const safe = safeHref(url);
		if (!safe) return false;
		if (!label) return this.formatting.execute("createLink", safe);
		const external = !safe.startsWith("#") && !safe.startsWith("/");
		const target = external
			? ' target="_blank" rel="noopener noreferrer"'
			: "";
		return this.formatting.execute(
			"insertHTML",
			`<a href="${escapeAttribute(safe)}"${target}>${escapeHtml(label)}</a>`
		);
	}

	/** Inserts a durable semantic bookmark without passing through execCommand normalization. */
	bookmark(name) {
		return insertSemanticBookmark(this.formatting.editor, name);
	}

	/** Returns human-readable internal navigation targets for dialog pickers. */
	navigationOptions() {
		return navigationPickerOptions(this.root);
	}

	/** Inserts a generated TOC block from current H1-H6 semantic headings. */
	tableOfContents(depth = 3) {
		const html = createTableOfContentsHtml(this.root, depth);
		if (!html) return false;
		return this.formatting.execute(
			"insertHTML",
			`<ul>${html}</ul><p><br></p>`
		);
	}

	/** Refreshes every generated TOC and records the mutation through the editor gateway. */
	refreshTableOfContents() {
		const count = refreshTableOfContents(this.root);
		if (count) this.formatting.editor.notifyMutation();
		return count;
	}

	/** Inserts one bounded collaborator mention. */
	mention(alias) {
		const name = String(alias || "").trim().slice(0, 80);
		if (!name) return false;
		return this.formatting.execute(
			"insertHTML",
			`<span data-mention="${escapeAttribute(name)}" class="mention">@${escapeHtml(name)}</span>&nbsp;`
		);
	}

	/** Inserts a bounded editable table followed by a paragraph escape hatch. */
	table(rows = 3, columns = 3) {
		const safeRows = Math.max(1, Math.min(12, Number(rows) || 3));
		const safeColumns = Math.max(1, Math.min(12, Number(columns) || 3));
		const cells = "<td><br></td>".repeat(safeColumns);
		const body = `<tr>${cells}</tr>`.repeat(safeRows);
		return this.formatting.execute(
			"insertHTML",
			`<table><tbody>${body}</tbody></table><p><br></p>`
		);
	}

	divider() {
		return this.formatting.execute("insertHTML", "<hr><p><br></p>");
	}

	checklist() {
		return this.formatting.execute("insertHTML", "<ul><li>☐ New task</li></ul>");
	}
}

/** Converts a candidate link to one safe explicit browser href or an empty refusal. */
function safeHref(value) {
	const text = String(value || "").trim();
	if (!isSafeDocumentUrl(text)) return "";
	if (text.startsWith("#") || text.startsWith("/")) return text;
	return new URL(text, location.origin).href;
}

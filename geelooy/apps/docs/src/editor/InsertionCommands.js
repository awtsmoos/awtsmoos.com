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

	/** Inserts a generated TOC as its own block after the block holding the caret. */
	tableOfContents(depth = 3) {
		const html = createTableOfContentsHtml(this.root, depth);
		if (!html) return false;
		if (!this.formatting.editor.isEditable()) return false;
		const block = this.#currentBlock();
		const list = document.createElement("ul");
		list.innerHTML = html;
		if (block) block.after(list);
		else this.root.append(list);
		const paragraph = document.createElement("p");
		paragraph.append(document.createElement("br"));
		list.after(paragraph);
		this.formatting.editor.notifyMutation();
		return true;
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

	/** Inserts one bounded inline image carried as a data URL. */
	image(dataUrl, alt = "") {
		const src = String(dataUrl || "");
		if (!/^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(src)) {
			return false;
		}
		if (src.length > 340000) return false;
		return this.formatting.execute(
			"insertHTML",
			`<img src="${src}" alt="${escapeAttribute(String(alt).slice(0, 120))}">`
		);
	}

	/** Adds or removes the table row beside the caret's cell. */
	tableRow(mode) {
		const cell = this.#currentCell();
		if (!cell) return false;
		const row = cell.parentElement;
		const table = row.closest("table");
		if (mode === "delete") {
			if (table.querySelectorAll("tr").length <= 1) return false;
			row.remove();
		} else {
			const clone = row.cloneNode(true);
			for (const cloned of clone.children) cloned.innerHTML = "<br>";
			if (mode === "above") row.before(clone);
			else row.after(clone);
		}
		this.formatting.editor.notifyMutation();
		return true;
	}

	/** Adds or removes the table column beside the caret's cell. */
	tableColumn(mode) {
		const cell = this.#currentCell();
		if (!cell) return false;
		const index = Array.from(cell.parentElement.children).indexOf(cell);
		const table = cell.closest("table");
		for (const row of table.querySelectorAll("tr")) {
			const target = row.children[index];
			if (!target) continue;
			if (mode === "delete") {
				if (row.children.length <= 1) return false;
				target.remove();
			} else {
				const blank = document.createElement(target.tagName.toLowerCase());
				blank.innerHTML = "<br>";
				if (mode === "left") target.before(blank);
				else target.after(blank);
			}
		}
		this.formatting.editor.notifyMutation();
		return true;
	}

	/** Returns the table cell holding the current selection, when there is one. */
	#currentCell() {
		const block = this.#currentBlock();
		if (!block) return null;
		const selection = window.getSelection();
		if (!selection?.rangeCount) return null;
		const node = selection.getRangeAt(0).commonAncestorContainer;
		const element = node.nodeType === Node.ELEMENT_NODE
			? node
			: node.parentElement;
		const cell = element?.closest?.("td, th");
		return cell && this.root.contains(cell) ? cell : null;
	}

	/** Inserts a page break that ends the printed page and flows past on screen. */
	pageBreak() {
		return this.formatting.execute(
			"insertHTML",
			"<hr data-page-break=\"true\"><p><br></p>"
		);
	}

	/** Inserts one literal character or symbol at the caret. */
	symbol(text) {
		const value = String(text || "").slice(0, 8);
		if (!value) return false;
		return this.formatting.execute("insertText", value);
	}

	/** Converts the current paragraph into a task list, or starts a new task. */
	checklist() {
		if (!this.formatting.editor.isEditable()) return false;
		const block = this.#currentBlock();
		if (block && block.tagName === "P") {
			const list = document.createElement("ul");
			list.dataset.checklist = "true";
			const item = document.createElement("li");
			const text = block.textContent.replace(/^[☐☑]\s*/, "").trim();
			item.textContent = `☐ ${text || "New task"}`;
			list.append(item);
			block.replaceWith(list);
			this.formatting.editor.notifyMutation();
			return true;
		}
		return this.formatting.execute(
			"insertHTML",
			"<ul data-checklist=\"true\"><li>☐ New task</li></ul>"
		);
	}

	/** Returns the top-level editor block holding the current selection. */
	#currentBlock() {
		const selection = window.getSelection();
		if (!selection?.rangeCount) return null;
		const node = selection.getRangeAt(0).commonAncestorContainer;
		const element = node.nodeType === Node.ELEMENT_NODE
			? node
			: node.parentElement;
		const block = element?.closest?.("[data-block-id]");
		return block && this.root.contains(block) ? block : null;
	}
}

/** Converts a candidate link to one safe explicit browser href or an empty refusal. */
function safeHref(value) {
	const text = String(value || "").trim();
	if (!isSafeDocumentUrl(text)) return "";
	if (text.startsWith("#") || text.startsWith("/")) return text;
	return new URL(text, location.origin).href;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos opens new forms inside finite text; Awtsmoos.com inserts tables,
 * mentions, links, lists, and dividers without importing a second editor universe.
 */
export class InsertionCommands {
	constructor(formatting) {
		this.formatting = formatting;
	}

	link(url, label = "") {
		const safe = this.#safeUrl(url);
		if (!safe) return false;
		if (label) return this.formatting.execute("insertHTML", `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
		return this.formatting.execute("createLink", safe);
	}

	mention(alias) {
		const name = String(alias || "").trim().slice(0, 80);
		if (!name) return false;
		return this.formatting.execute("insertHTML", `<span data-mention="${escapeHtml(name)}" class="mention">@${escapeHtml(name)}</span>&nbsp;`);
	}

	table(rows = 3, columns = 3) {
		const safeRows = Math.max(1, Math.min(12, Number(rows) || 3));
		const safeColumns = Math.max(1, Math.min(12, Number(columns) || 3));
		const cells = "<td><br></td>".repeat(safeColumns);
		const html = `<table><tbody>${`<tr>${cells}</tr>`.repeat(safeRows)}</tbody></table><p><br></p>`;
		return this.formatting.execute("insertHTML", html);
	}

	divider() {
		return this.formatting.execute("insertHTML", "<hr><p><br></p>");
	}

	checklist() {
		return this.formatting.execute("insertHTML", "<ul><li>☐ New task</li></ul>");
	}

	#safeUrl(value) {
		try {
			const url = new URL(String(value || ""), location.origin);
			return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
		} catch {
			return "";
		}
	}
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
}

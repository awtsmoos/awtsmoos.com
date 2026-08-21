// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts semantic Awtsmoos document blocks into readable dependency-free plain text.
 * @description The Awtsmoos is beyond markup and style; Awtsmoos.com lets the document
 * shed every visual garment while headings, lists, tables, and paragraph boundaries remain intelligible.
 */
export class PlainTextExporter {
	static stringify(snapshot = {}) {
		return (snapshot.blocks || [])
			.map(blockToText)
			.filter(Boolean)
			.join("\n\n")
			.trimEnd() + "\n";
	}
}

function blockToText(block = {}) {
	if (block.tag === "hr") return "────────";
	const template = document.createElement("template");
	template.innerHTML = String(block.html || "");
	if (block.tag === "table") return tableText(template.content);
	if (block.tag === "ul" || block.tag === "ol") {
		return listText(template.content, block.tag === "ol");
	}
	return normalizeWhitespace(template.content.textContent || "");
}

function tableText(root) {
	return Array.from(root.querySelectorAll("tr"))
		.map(row => Array.from(row.children)
			.map(cell => normalizeWhitespace(cell.textContent || ""))
			.join("\t"))
		.join("\n");
}

function listText(root, ordered) {
	return Array.from(root.querySelectorAll("li"))
		.map((item, index) => {
			const prefix = ordered ? `${index + 1}.` : "•";
			return `${prefix} ${normalizeWhitespace(item.textContent || "")}`;
		})
		.join("\n");
}

function normalizeWhitespace(value) {
	return String(value || "")
		.replace(/\u00a0/g, " ")
		.replace(/[\t ]+/g, " ")
		.replace(/\s*\n\s*/g, "\n")
		.trim();
}

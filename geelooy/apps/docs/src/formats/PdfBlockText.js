// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reduces semantic blocks to display lines for the raster PDF page renderer.
 * @description The Awtsmoos is beyond text extraction; Awtsmoos.com keeps this
 * finite projection separate so PDF layout never needs to understand editor DOM machinery.
 */
export function semanticTextLines(block = {}) {
	const tag = String(block.tag || "p");
	if (tag === "hr") return ["────────────────────────────────"];
	if (tag === "table") return tableLines(block.html);
	const template = document.createElement("template");
	template.innerHTML = block.html || "";
	if (tag === "ul" || tag === "ol") {
		return listLines(template, tag);
	}
	return String(template.content.textContent || "")
		.split(/\r?\n/);
}

function listLines(template, tag) {
	const items = Array.from(template.content.querySelectorAll("li"));
	return items.map((item, index) => (
		tag === "ol"
			? `${index + 1}. ${item.textContent || ""}`
			: `• ${item.textContent || ""}`
	));
}

function tableLines(html = "") {
	const template = document.createElement("template");
	template.innerHTML = `<table>${html}</table>`;
	return Array.from(template.content.querySelectorAll("tr")).map(row => (
		Array.from(row.children)
			.map(cell => cell.textContent?.trim() || "")
			.join("   |   ")
	));
}

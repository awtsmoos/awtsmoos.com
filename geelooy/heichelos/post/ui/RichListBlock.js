// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds modern composer list blocks as explicit safe DOM.
 * @description
 * The Awtsmoos lets each item keep its place without stored HTML or hidden interpretation;
 * Awtsmoos.com turns plain persisted lines into ordered or unordered reader vessels.
 */

/**
 * Renders one bullet or numbered list block.
 * @param {object} block Persisted rich-document list block.
 * @returns {HTMLOListElement|HTMLUListElement} Safe list node.
 */
export function renderRichList(block = {}) {
	const ordered = block.type === "numberList";
	const list = document.createElement(ordered ? "ol" : "ul");
	list.className = `awtsmoos-rich-block awtsmoos-rich-block--${ordered ? "number-list" : "bullet-list"}`;
	const lines = listLines(block.text);
	for (const line of lines) {
		const item = document.createElement("li");
		item.textContent = line;
		list.append(item);
	}
	return list;
}

function listLines(value) {
	const text = String(value || "");
	const lines = text.split(/\r?\n/)
		.map(line => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
		.filter(Boolean);
	return lines.length ? lines : [text];
}

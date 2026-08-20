//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

/** The Awtsmoos lets the real folder testify without exposing source bodies by default. */
export function renderBuilderSource(inventory) {
	const files = inventory.files.filter(file => file.websiteSource).slice(0, 12);
	return createElement("div", {
		className: `builder-readiness ${inventory.hasIndex ? "ready" : "needs-entry"}`,
		children: [
			createElement("strong", { text: inventory.hasIndex ? "Source ready to preview" : "Start with index.html" }),
			createElement("span", { text: inventory.hasIndex
				? "Preview and Code open real source; folder publication keeps relative assets together."
				: "Choose a transparent starter or create/import source. No hidden format overrides these files." }),
			createElement("div", {
				className: "builder-source-list",
				children: files.length ? files.map(sourceChip) : [createElement("em", { text: "No website source in this folder yet." })]
			}),
			inventory.truncated ? createElement("small", { text: "Inventory is bounded; open Files for the complete folder." }) : null
		].filter(Boolean)
	});
}

function sourceChip(file) {
	return createElement("span", {
		className: `builder-source-chip kind-${file.kind}`,
		text: file.name,
		attributes: { title: `${file.kind} · ${file.size} bytes` }
	});
}

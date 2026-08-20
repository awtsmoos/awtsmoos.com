// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies dependency-free inline SVG symbols for the Awtsmoos Docs command surface.
 * @description The Awtsmoos is beyond sign and shape; Awtsmoos.com gives each action
 * a quiet visible siman so power can be recognized quickly without borrowing an external icon vessel.
 */
const PATHS = Object.freeze({
	undo: "M9 7 5 11l4 4M5 11h8a6 6 0 0 1 6 6",
	redo: "m15 7 4 4-4 4m4-4h-8a6 6 0 0 0-6 6",
	bold: "M8 5h5a3 3 0 0 1 0 6H8m0 0h6a3 3 0 0 1 0 6H8V5",
	italic: "M10 5h7M7 19h7m1-14-6 14",
	underline: "M7 5v6a5 5 0 0 0 10 0V5M5 20h14",
	link: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1",
	comment: "M5 5h14v11H9l-4 4V5",
	list: "M9 6h10M9 12h10M9 18h10M5 6h.01M5 12h.01M5 18h.01",
	numbers: "M5 5v4m-1-3 1-1h1M4 13h2l-2 3h2M9 6h10M9 12h10M9 18h10",
	check: "m4 12 3 3 5-6M12 7h7M12 13h7M12 19h7",
	align: "M5 6h14M7 10h10M5 14h14M7 18h10",
	page: "M7 3h7l4 4v14H7V3m7 0v5h4",
	open: "M4 7h6l2 2h8v10H4V7m8 6 3-3m0 0 3 3m-3-3v7",
	save: "M5 4h12l3 3v13H4V4h1m3 0v6h8V4M8 20v-6h8v6",
	export: "M12 3v12m-4-4 4 4 4-4M5 19h14",
	code: "m9 8-4 4 4 4m6-8 4 4-4 4m-3-10-3 20",
	share: "M8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm11-4a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM8 10l8-4M8 14l8 3",
	outline: "M5 6h14M5 12h9M5 18h12",
	notes: "M5 4h14v16H5V4m4 4h6M9 12h6M9 16h4",
	format: "M5 19 12 5l7 14M8 14h8",
	margins: "M4 4h16v16H4V4m4 0v16m8-16v16",
	orientation: "M4 7h16v10H4V7m8-3 3 3-3 3"
});

export function hydrateIcons(root = document) {
	for (const target of root.querySelectorAll("[data-icon]")) {
		const path = PATHS[target.dataset.icon];
		if (!path || target.querySelector("svg")) continue;
		target.prepend(createIcon(path));
	}
}

function createIcon(path) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("aria-hidden", "true");
	svg.classList.add("command-icon");
	const element = document.createElementNS("http://www.w3.org/2000/svg", "path");
	element.setAttribute("d", path);
	element.setAttribute("fill", "none");
	element.setAttribute("stroke", "currentColor");
	element.setAttribute("stroke-width", "1.8");
	element.setAttribute("stroke-linecap", "round");
	element.setAttribute("stroke-linejoin", "round");
	svg.append(element);
	return svg;
}

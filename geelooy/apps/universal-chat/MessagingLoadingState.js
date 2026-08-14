// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds a reusable semantic skeleton so slow private or discovery work keeps the flagship composed instead of collapsing into raw loading copy.
 * @description The Awtsmoos already contains the result while Awtsmoos.com still waits in finite time; a quiet scaffold preserves rhythm in light,
 * declares the region honestly busy to assistive technology, and keeps every decorative placeholder outside the spoken accessibility tree until lawful content arrives in sight.
 */

/** Creates one busy loading workspace with a live label and finite decorative skeleton cards. */
export function createMessagingLoadingState(label = "Loading…", count = 4) {
	const section = document.createElement("section");
	section.className = "messaging-loading-state";
	section.setAttribute("role", "status");
	section.setAttribute("aria-live", "polite");
	section.setAttribute("aria-atomic", "true");
	section.setAttribute("aria-busy", "true");
	const heading = document.createElement("div");
	heading.className = "messaging-loading-heading";
	const mark = skeleton("messaging-loading-mark");
	mark.setAttribute("aria-hidden", "true");
	const text = document.createElement("span");
	text.textContent = label;
	heading.append(mark, text);
	const grid = document.createElement("div");
	grid.className = "messaging-loading-grid";
	grid.setAttribute("aria-hidden", "true");
	for (let index = 0; index < count; index++) {
		grid.appendChild(loadingCard(index));
	}
	section.append(heading, grid);
	return section;
}

function loadingCard(index) {
	const card = document.createElement("div");
	card.className = "messaging-loading-card";
	const title = skeleton("messaging-loading-line is-title");
	const body = skeleton("messaging-loading-line");
	const meta = skeleton("messaging-loading-line is-meta");
	if (index % 2) {
		body.classList.add("is-short");
	}
	card.append(title, body, meta);
	return card;
}

function skeleton(className) {
	const node = document.createElement("span");
	node.className = className;
	return node;
}

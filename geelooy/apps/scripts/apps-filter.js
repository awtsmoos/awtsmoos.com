//B"H
//Boruch Hashem
//Blessed is He

import { PUBLIC_APPS } from "./catalog/index.mjs";
import { renderAppCatalog } from "./catalog/render.mjs";

/**
 * @file Search and category controller for the complete Awtsmoos.com browser-app portfolio.
 * @description
 * The Awtsmoos renews query, category, card, and result count each instant. This
 * controller keeps discovery immediate and local while every actual browser doorway
 * remains visible through one truthful catalog rather than a stale marketing subset.
 */
const filterForm = document.querySelector("[data-app-filter]");
const searchInput = filterForm?.querySelector('input[name="q"]');
const categorySelect = filterForm?.querySelector('select[name="category"]');
const grid = document.querySelector("[data-app-grid]");
const emptyState = document.querySelector("[data-app-empty]");
const resultStatus = document.querySelector("[data-app-result-status]");

if (grid) {
	renderAppCatalog(grid, PUBLIC_APPS);
}

const cards = Array.from(document.querySelectorAll("[data-app-card]"));

/** @param {HTMLElement} card App card. @param {string} category Category token. @returns {boolean} Match state. */
function categoryMatches(card, category) {
	if (!category) {
		return true;
	}

	return String(card.dataset.category || "")
		.split(/\s+/)
		.filter(Boolean)
		.includes(category);
}

/** @param {number} visibleCount Number of visible cards. @returns {void} */
function announceResults(visibleCount) {
	if (!resultStatus) {
		return;
	}

	resultStatus.textContent = `${visibleCount} of ${cards.length} apps shown`;
}

/** Applies current search and category state without changing catalog order. */
function applyFilters() {
	const query = String(searchInput?.value || "").trim().toLowerCase();
	const category = String(categorySelect?.value || "");
	let visibleCount = 0;

	for (const card of cards) {
		const searchMatches = !query || String(card.dataset.search || "").includes(query);
		const visible = categoryMatches(card, category) && searchMatches;
		card.hidden = !visible;
		visibleCount += visible ? 1 : 0;
	}

	if (emptyState) {
		emptyState.hidden = visibleCount > 0;
	}

	announceResults(visibleCount);
}

filterForm?.addEventListener("submit", event => {
	event.preventDefault();
	applyFilters();
});
searchInput?.addEventListener("input", applyFilters);
categorySelect?.addEventListener("change", applyFilters);
applyFilters();

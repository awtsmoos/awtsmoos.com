// B"H
// Boruch Hashem
// Blessed is He

import { PUBLIC_APPS } from "./catalog/index.mjs";
import { renderAppCatalog } from "./catalog/render.mjs";

/**
 * B"H
 *
 * Boots and filters the twelve intentional Awtsmoos.com public products from one
 * explicit catalog. Hidden experimental directories do not become products merely
 * because they exist on disk. The Awtsmoos renews query, category, and card each
 * instant; this controller keeps discovery local, deterministic, and inspectable.
 */

const filterForm = document.querySelector("[data-app-filter]");
const searchInput = filterForm?.querySelector('input[name="q"]');
const categorySelect = filterForm?.querySelector('select[name="category"]');
const grid = document.querySelector("[data-app-grid]");
const emptyState = document.querySelector("[data-app-empty]");

if (grid) {
	renderAppCatalog(grid, PUBLIC_APPS);
}

const cards = Array.from(document.querySelectorAll("[data-app-card]"));

/**
 * Produces searchable lowercase text from one rendered public app card.
 *
 * @param {HTMLElement} card
 * 	App card element.
 * @returns {string}
 * 	Normalized searchable text.
 */
function cardSearchText(card) {
	return `${card.textContent || ""} ${card.dataset.category || ""}`.toLowerCase();
}

/**
 * Tests whether one app belongs to the selected category token.
 *
 * @param {HTMLElement} card
 * 	App card element.
 * @param {string} category
 * 	Selected category or an empty string for all.
 * @returns {boolean}
 * 	Whether the card satisfies the category constraint.
 */
function categoryMatches(card, category) {
	if (!category) {
		return true;
	}

	return String(card.dataset.category || "")
		.split(/\s+/)
		.filter(Boolean)
		.includes(category);
}

/**
 * Applies current search/category state without changing portfolio order.
 */
function applyFilters() {
	const query = String(searchInput?.value || "").trim().toLowerCase();
	const category = String(categorySelect?.value || "");
	let visibleCount = 0;

	for (const card of cards) {
		const visible = categoryMatches(card, category)
			&& (!query || cardSearchText(card).includes(query));
		card.hidden = !visible;
		visibleCount += visible ? 1 : 0;
	}

	if (emptyState) {
		emptyState.hidden = visibleCount > 0;
	}
}

filterForm?.addEventListener("submit", event => {
	event.preventDefault();
	applyFilters();
});
searchInput?.addEventListener("input", applyFilters);
categorySelect?.addEventListener("change", applyFilters);
applyFilters();

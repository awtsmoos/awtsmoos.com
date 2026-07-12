// B"H
/**
 * @module AwtsmoosAppsFilter
 * @description Filters the static application constellation without changing
 * any destination. Each visible door remains a real, native link.
 */
const form = document.querySelector('[data-app-filter]');
const cards = Array.from(document.querySelectorAll('[data-app-card]'));
const empty = document.querySelector('[data-app-empty]');

/** Applies the current name and category filters. */
function applyFilters() {
	const query = String(form?.elements.q?.value || '').trim().toLowerCase();
	const category = String(form?.elements.category?.value || '').trim().toLowerCase();
	let visible = 0;
	cards.forEach(card => {
		const text = card.textContent.toLowerCase();
		const categories = String(card.dataset.category || '').toLowerCase().split(/\s+/);
		const matches = (!query || text.includes(query)) && (!category || categories.includes(category));
		card.hidden = !matches;
		if (matches) visible += 1;
	});
	if (empty) empty.hidden = visible > 0;
}

form?.addEventListener('input', applyFilters);
form?.addEventListener('submit', event => event.preventDefault());
applyFilters();

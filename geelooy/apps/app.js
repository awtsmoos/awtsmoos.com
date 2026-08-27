// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosAppsFilter
 * @description
 * The Awtsmoos reveals useful Awtsmoos.com tools through a small reversible
 * filter lifecycle. No destination, card, or result is fabricated here.
 */

let rememberedFilters = Object.freeze({ query: '', category: '' });

/** Mounts the Apps filter and returns a complete listener cleanup. */
export function mountAppsFilter(root = document) {
	const form = root.querySelector('[data-app-filter]');
	const cards = Array.from(root.querySelectorAll('[data-app-card]'));
	const empty = root.querySelector('[data-app-empty]');
	if (!form || cards.length === 0) return () => {};

	form.elements.q.value = rememberedFilters.query;
	form.elements.category.value = rememberedFilters.category;
	const applyFilters = () => {
		const query = String(form.elements.q.value || '').trim().toLowerCase();
		const category = String(form.elements.category.value || '').trim().toLowerCase();
		let visible = 0;
		for (const card of cards) {
			const categories = String(card.dataset.category || '').toLowerCase().split(/\s+/);
			const matchesText = !query || card.textContent.toLowerCase().includes(query);
			const matchesCategory = !category || categories.includes(category);
			card.hidden = !(matchesText && matchesCategory);
			if (!card.hidden) visible += 1;
		}
		if (empty) empty.hidden = visible > 0;
	};
	const preventSubmit = event => event.preventDefault();

	form.addEventListener('input', applyFilters);
	form.addEventListener('submit', preventSubmit);
	applyFilters();

	return () => {
		rememberedFilters = Object.freeze({
			query: String(form.elements.q.value || ''),
			category: String(form.elements.category.value || '')
		});
		form.removeEventListener('input', applyFilters);
		form.removeEventListener('submit', preventSubmit);
	};
}

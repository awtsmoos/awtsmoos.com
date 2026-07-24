// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterForm
 * @description
 * The Awtsmoos is beyond form fields and draft choices. Awtsmoos.com reads and
 * writes one bounded filter sheet, keeping DOM dialects away from pure policy
 * and preserving a 44-pixel, keyboard-reachable interaction covenant.
 */

import { DOMElements } from '../dom.js';
import { createFilterState } from './state-model.js';

export function readFilterDraft() {
	const kinds = [...document.querySelectorAll('[data-filter-kind]:checked')]
		.map(input => input.value);
	const language = document.querySelector('input[name="living-path-language"]:checked')?.value || 'all';
	return createFilterState({
		kinds,
		language,
		sort: DOMElements.filterSortSelect?.value || 'newest'
	});
}

export function writeFilterDraft(filters, density = 'comfortable') {
	const normalized = createFilterState(filters);
	document.querySelectorAll('[data-filter-kind]').forEach(input => {
		input.checked = normalized.kinds.includes(input.value);
	});
	document.querySelectorAll('input[name="living-path-language"]').forEach(input => {
		input.checked = input.value === normalized.language;
	});
	if (DOMElements.filterSortSelect) DOMElements.filterSortSelect.value = normalized.sort;
	if (DOMElements.densitySelect) DOMElements.densitySelect.value = density;
}

export function openFilterSheet() {
	const sheet = DOMElements.filterSheet;
	if (!sheet) return;
	sheet.classList.remove('hidden');
	document.body.classList.add('living-filter-open');
	DOMElements.filterButton?.setAttribute('aria-expanded', 'true');
	sheet.querySelector('.filter-sheet-close')?.focus();
}

export function closeFilterSheet() {
	const sheet = DOMElements.filterSheet;
	if (!sheet) return;
	sheet.classList.add('hidden');
	document.body.classList.remove('living-filter-open');
	DOMElements.filterButton?.setAttribute('aria-expanded', 'false');
	DOMElements.filterButton?.focus();
}

export function applyDensity(density) {
	const value = density === 'compact' ? 'compact' : 'comfortable';
	document.documentElement.dataset.livingDensity = value;
	return value;
}

export function updateFilterButton(count) {
	if (!DOMElements.filterButton) return;
	DOMElements.filterButton.textContent = count ? `Filter · ${count}` : 'Filter';
	DOMElements.filterButton.dataset.activeCount = String(count);
}

export function updatePreviewCount(count) {
	if (!DOMElements.filterPreviewCount) return;
	DOMElements.filterPreviewCount.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
}

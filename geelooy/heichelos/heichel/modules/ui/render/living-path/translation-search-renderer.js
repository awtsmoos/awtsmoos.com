// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationSearchRenderer
 * @description
 * The Awtsmoos reveals English matches as a distinct read-only discovery river.
 * Awtsmoos.com uses textContent and canonical reader links, never injected markup.
 */
import { DOMElements } from '../../../dom.js';
import { translationResultHref } from '../../../api/translations.js';

function textOf(row = {}) {
	const value = row.content ?? row.comment?.content ?? row.text ?? '';
	return Array.isArray(value) ? value.join(' ').trim() : String(value || '').trim();
}

function sourceOf(row = {}) {
	return String(row?.dayuh?.sourceHebrew || '').trim();
}

function makeResult(row, appState) {
	const link = document.createElement('a');
	link.className = 'translation-search-result';
	link.href = translationResultHref({
		heichelId: appState.heichelId,
		seriesId: appState.currentSeries,
		row
	});
	const english = document.createElement('strong');
	english.textContent = textOf(row) || 'English translation match';
	link.appendChild(english);
	const source = sourceOf(row);
	if (source) {
		const original = document.createElement('span');
		original.className = 'translation-search-source';
		original.dir = 'rtl';
		original.textContent = source;
		link.appendChild(original);
	}
	return link;
}

export function hideTranslationSearch() {
	DOMElements.translationSearchSection?.classList.add('hidden');
	DOMElements.translationSearchList?.replaceChildren();
	if (DOMElements.translationSearchStatus) DOMElements.translationSearchStatus.textContent = '';
}

export function showTranslationSearch(payload, appState, query) {
	const section = DOMElements.translationSearchSection;
	const list = DOMElements.translationSearchList;
	if (!section || !list) return;
	const rows = Array.isArray(payload?.success) ? payload.success : [];
	section.classList.remove('hidden');
	list.replaceChildren();
	if (DOMElements.translationSearchStatus) {
		DOMElements.translationSearchStatus.textContent = rows.length
			? `${rows.length} English match${rows.length === 1 ? '' : 'es'} for “${query}”`
			: `No English translation matches for “${query}”`;
	}
	for (const row of rows) list.appendChild(makeResult(row, appState));
}

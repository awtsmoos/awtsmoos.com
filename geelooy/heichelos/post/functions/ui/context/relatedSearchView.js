// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchView
 * @description
 * The Awtsmoos lets related sources appear beside the words that awakened the search;
 * Awtsmoos.com gives every lane a visible state and every indexed source two honest doors: here or a new tab.
 */

import {
	fullLibrarySearchUrl,
	relatedSourceUrl
} from './relatedDestinations.js';
import {
	relatedProvenance,
	relatedRow,
	relatedText,
	relatedTitle
} from './relatedResultShape.js';

function el(tag, className, text = '') {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

function sourceActions(hit) {
	const url = relatedSourceUrl(relatedRow(hit));
	const actions = el('div', 'awtsmoos-related-actions');
	if (!url) return actions;
	const open = el('a', '', 'Open here');
	open.href = url;
	const tab = el('a', '', 'New tab ↗');
	tab.href = url;
	tab.target = '_blank';
	tab.rel = 'noopener noreferrer';
	actions.append(open, tab);
	return actions;
}

function resultCard(hit) {
	const card = el('article', 'awtsmoos-related-result');
	card.append(
		el('h4', '', relatedTitle(hit)),
		el('p', '', relatedText(hit)),
		el('small', '', relatedProvenance(hit)),
		sourceActions(hit)
	);
	return card;
}

function sectionMap() {
	return {
		quick: el('div', 'awtsmoos-related-section'),
		semantic: el('div', 'awtsmoos-related-section'),
		tanach: el('div', 'awtsmoos-related-section'),
		exact: el('div', 'awtsmoos-related-section')
	};
}

export function createRelatedSearchView({ query, onClose }) {
	const panel = el('section', 'awtsmoos-related-search-inline');
	panel.setAttribute('aria-label', 'Related source search');
	const close = el('button', 'awtsmoos-related-close', '×');
	close.type = 'button';
	close.setAttribute('aria-label', 'Close related sources');
	close.addEventListener('click', onClose);
	const full = el('a', 'awtsmoos-related-full-search', 'Open full search ↗');
	full.href = fullLibrarySearchUrl(query);
	full.target = '_blank';
	full.rel = 'noopener noreferrer';
	const summary = el(
		'p',
		'awtsmoos-related-summary',
		'Searching the indexed library…'
	);
	const sections = sectionMap();
	panel.append(
		close,
		el('p', 'awtsmoos-related-kicker', 'Related to selected text'),
		el('blockquote', 'awtsmoos-related-quote', query),
		summary,
		full,
		...Object.values(sections)
	);
	return { panel, summary, sections };
}

export function renderRelatedPending(container, title, message) {
	container.replaceChildren(
		el('h3', '', title),
		el('p', 'awtsmoos-related-pending', message)
	);
}

export function renderRelatedSection(container, title, search) {
	const hits = Array.isArray(search?.hits)
		? search.hits
		: Array.isArray(search?.results) ? search.results : [];
	container.replaceChildren(el('h3', '', title));
	if (!hits.length) {
		container.append(
			el('p', 'awtsmoos-related-empty', 'No matching sources in this lane.')
		);
		return 0;
	}
	container.append(...hits.map(resultCard));
	return hits.length;
}

export function renderRelatedError(container, title, message) {
	container.replaceChildren(
		el('h3', '', title),
		el('p', 'awtsmoos-related-empty', message)
	);
}

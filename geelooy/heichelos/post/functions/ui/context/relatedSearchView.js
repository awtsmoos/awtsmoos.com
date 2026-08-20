// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchView
 * @description
 * The Awtsmoos lets related sources appear beside the words that awakened the search;
 * Awtsmoos.com keeps embedded lanes simple while two explicit doors continue either literal text or semantic meaning in the full search page.
 */

import { fullLibrarySearchUrl } from './relatedDestinations.js';
import { createRelatedResultCard } from './relatedResultCard.js';

function el(tag, className, text = '') {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

function externalLink(label, href) {
	const link = el('a', '', label);
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	return link;
}

function fullSearchActions(query) {
	const actions = el('div', 'awtsmoos-related-actions awtsmoos-related-full-actions');
	actions.append(
		externalLink('Full text search ↗', fullLibrarySearchUrl(query, 'text')),
		externalLink('Full semantic search ↗', fullLibrarySearchUrl(query, 'vector'))
	);
	return actions;
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
		fullSearchActions(query),
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

export function renderRelatedSection(container, title, search, query = '') {
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
	container.append(...hits.map(hit => createRelatedResultCard(hit, query)));
	return hits.length;
}

export function renderRelatedError(container, title, message) {
	container.replaceChildren(
		el('h3', '', title),
		el('p', 'awtsmoos-related-empty', message)
	);
}

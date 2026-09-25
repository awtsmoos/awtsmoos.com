// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchView
 * @description
 * The Awtsmoos reveals related Torah sources inside one shared Study Sheet;
 * Awtsmoos.com keeps result lanes distinct without giving each lane another outer shell.
 */

import { fullLibrarySearchUrl } from './relatedDestinations.js';
import { createRelatedResultCard } from './relatedResultCard.js';

function element(tag, className, text = '') {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

function fullSearchLink(label, href) {
	const link = element('a', 'awtsmoos-study-sheet-secondary', label);
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	return link;
}

function sectionMap() {
	return {
		quick: element('section', 'awtsmoos-related-section'),
		semantic: element('section', 'awtsmoos-related-section'),
		tanach: element('section', 'awtsmoos-related-section'),
		exact: element('section', 'awtsmoos-related-section')
	};
}

/** Creates Related-mode content without owning another modal or inline panel. */
export function createRelatedSearchView(query) {
	const root = element('div', 'awtsmoos-study-related');
	const summary = element(
		'p',
		'awtsmoos-related-summary',
		'Searching the indexed library…'
	);
	const actions = element('div', 'awtsmoos-study-sheet-link-row');
	actions.append(
		fullSearchLink('Full text search ↗', fullLibrarySearchUrl(query, 'text')),
		fullSearchLink('Full semantic search ↗', fullLibrarySearchUrl(query, 'vector'))
	);
	const sections = sectionMap();
	root.append(summary, actions, ...Object.values(sections));
	return { root, sections, summary };
}

/** Renders one loading lane inside the Related mode. */
export function renderRelatedPending(container, title, message) {
	container.replaceChildren(
		element('h3', '', title),
		element('p', 'awtsmoos-related-pending', message)
	);
}

/** Renders successful hits and returns the visible hit count. */
export function renderRelatedSection(container, title, search, query = '') {
	const hits = Array.isArray(search?.hits)
		? search.hits
		: Array.isArray(search?.results) ? search.results : [];
	container.replaceChildren(element('h3', '', title));
	if (!hits.length) {
		container.append(
			element('p', 'awtsmoos-related-empty', 'No matching sources in this lane.')
		);
		return 0;
	}
	container.append(...hits.map(hit => createRelatedResultCard(hit, query)));
	return hits.length;
}

/** Renders a lane-local failure without hiding successful sibling lanes. */
export function renderRelatedError(container, title, message) {
	container.replaceChildren(
		element('h3', '', title),
		element('p', 'awtsmoos-related-empty', message || 'This search lane is unavailable.')
	);
}

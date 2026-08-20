// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedResultCard
 * @description
 * The Awtsmoos lets one related source show the selected spark inside enough neighboring text to understand it;
 * Awtsmoos.com keeps source provenance and exact reader doors beside a compact, direction-aware highlighted preview.
 */

import { relatedSourceUrl } from './relatedDestinations.js';
import { relatedPreviewParts } from './relatedPreview.js';
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

function previewCandidates(hit, query) {
	return [hit?.originalWord, query].filter(Boolean);
}

function appendPreview(target, hit, query) {
	const parts = relatedPreviewParts(
		relatedText(hit),
		previewCandidates(hit, query)
	);
	if (parts.leading) target.append('… ');
	target.append(parts.before);
	if (parts.match) {
		const mark = document.createElement('mark');
		mark.textContent = parts.match;
		target.append(mark);
	}
	target.append(parts.after);
	if (parts.trailing) target.append(' …');
}

/**
 * @param {object} hit Search result from any related-source lane.
 * @param {string} query Reader-selected query.
 * @returns {HTMLElement} Compact related-source card.
 */
export function createRelatedResultCard(hit, query = '') {
	const card = el('article', 'awtsmoos-related-result');
	const preview = el('p');
	preview.dir = 'auto';
	appendPreview(preview, hit, query);
	card.append(
		el('h4', '', relatedTitle(hit)),
		preview,
		el('small', '', relatedProvenance(hit)),
		sourceActions(hit)
	);
	return card;
}

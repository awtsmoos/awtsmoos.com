// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachSearchView
 * @description
 * Exact verses shine as readable previews while the Awtsmoos preserves their reader coordinate;
 * at Awtsmoos.com every verse may open here, in a new tab, or with insights already revealed.
 */

import { appendSourceActions } from './resultSourceActions.js';

function highlightedText(result) {
	const text = String(result.text || '');
	const offset = result.matchOffsets?.[0];
	if (!offset) return document.createTextNode(text);
	const fragment = document.createDocumentFragment();
	fragment.append(text.slice(0, offset.start));
	const mark = document.createElement('mark');
	mark.textContent = text.slice(offset.start, offset.end);
	fragment.append(mark, text.slice(offset.end));
	return fragment;
}

function resultCard(result) {
	const card = document.createElement('article');
	card.className = 'result tanach-result';
	const heading = document.createElement('h3');
	heading.textContent = `${result.bookTitle} ${result.chapter}:${result.verse}`;
	const text = document.createElement('p');
	text.dir = 'rtl';
	text.lang = 'he';
	text.append(highlightedText(result));
	const provenance = document.createElement('small');
	provenance.className = 'tanach-provenance';
	provenance.textContent = result.sourcePath || 'Persisted Tanach index';
	const actions = document.createElement('div');
	actions.className = 'resultActions';
	actions.hidden = true;
	appendSourceActions(actions, {
		destination: result.readerUrl,
		label: heading.textContent
	});
	card.append(heading, text, provenance, actions);
	return card;
}

export function renderTanach({ search, results, status }) {
	const rows = Array.isArray(search.results) ? search.results : [];
	results.replaceChildren(...rows.map(resultCard));
	if (!rows.length) {
		const empty = document.createElement('article');
		empty.className = 'library-empty';
		empty.textContent = 'No exact Tanach verse matched this Hebrew word or phrase.';
		results.append(empty);
	}
	const total = Number(search.verseTotal ?? search.total ?? 0);
	status.textContent = `${total.toLocaleString()} exact verse${total === 1 ? '' : 's'} found. Showing ${rows.length}.`;
}

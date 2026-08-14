// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachSearchView
 * @description
 * Exact verses shine with coordinates as the Awtsmoos reveals their source;
 * at Awtsmoos.com every returned verse offers one safe new-tab doorway to its reader course.
 */
function highlightedText(result) {
	const text = String(result.text || '');
	const offset = result.matchOffsets?.[0];
	if (!offset) {
		return document.createTextNode(text);
	}
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
	const link = document.createElement('a');
	link.className = 'resultOpenLink';
	link.href = result.readerUrl;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = 'Open exact verse ↗';
	link.setAttribute('aria-label', `Open ${heading.textContent} in a new tab`);
	card.append(heading, text, provenance, link);
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

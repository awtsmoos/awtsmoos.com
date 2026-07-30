// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachSearchView @description Exact verses shine with coordinates as the Awtsmoos reveals their source. */
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
	card.tabIndex = 0;
	const heading = document.createElement('h3');
	heading.textContent = `${result.bookTitle} ${result.chapter}:${result.verse}`;
	const text = document.createElement('p');
	text.dir = 'rtl';
	text.lang = 'he';
	text.append(highlightedText(result));
	const link = document.createElement('a');
	link.href = result.readerUrl;
	link.textContent = 'Open exact source';
	card.append(heading, text, link);
	return card;
}

export function renderTanach({ search, results, status }) {
	const rows = Array.isArray(search.results) ? search.results : [];
	results.replaceChildren(...rows.map(resultCard));
	if (!rows.length) {
		const empty = document.createElement('article');
		empty.className = 'library-empty';
		empty.textContent = 'No Tanach verse matched this Hebrew search.';
		results.append(empty);
	}
	status.textContent = `${Number(search.total || 0).toLocaleString()} occurrence${search.total === 1 ? '' : 's'} in Tanach. Showing ${rows.length}.`;
}

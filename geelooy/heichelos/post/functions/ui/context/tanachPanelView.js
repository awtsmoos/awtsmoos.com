// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachPanelView
 * @description
 * The Awtsmoos lets exact Tanach verses appear as compact, readable study rows;
 * Awtsmoos.com keeps every result inside the shared Study Sheet instead of another modal.
 */

function bilingualReaderUrl(result) {
	const url = new URL(result.readerUrl, window.location.origin);
	url.searchParams.set('tanachLanguage', 'both');
	return `${url.pathname}${url.search}`;
}

/** Builds one compact exact-verse result row. */
export function resultRow(result) {
	const group = document.createElement('article');
	group.className = 'awtsmoos-tanach-result-group';

	const heading = document.createElement('div');
	heading.className = 'awtsmoos-tanach-result-heading';
	const title = document.createElement('strong');
	title.textContent = `${result.bookTitle} ${result.chapter}:${result.verse}`;
	const count = document.createElement('small');
	const occurrences = Number(result.occurrenceCount || result.matchOffsets?.length || 0);
	count.textContent = `${occurrences} occurrence${occurrences === 1 ? '' : 's'}`;
	heading.append(title, count);

	const text = document.createElement('p');
	text.className = 'awtsmoos-tanach-result-text';
	text.dir = 'rtl';
	text.lang = 'he';
	text.textContent = result.text;

	const actions = document.createElement('div');
	actions.className = 'awtsmoos-tanach-result-actions';
	const open = document.createElement('a');
	open.className = 'awtsmoos-study-sheet-primary';
	open.href = result.readerUrl;
	open.textContent = 'Open verse →';
	const bilingual = document.createElement('a');
	bilingual.className = 'awtsmoos-study-sheet-secondary';
	bilingual.href = bilingualReaderUrl(result);
	bilingual.textContent = 'Hebrew + English';
	actions.append(open, bilingual);

	group.append(heading, text, actions);
	return group;
}

/** Creates Tanach-mode content without owning backdrop or dialog geometry. */
export function createTanachStudyView() {
	const root = document.createElement('div');
	root.className = 'awtsmoos-study-tanach';
	const status = document.createElement('p');
	status.className = 'awtsmoos-tanach-status';
	status.setAttribute('role', 'status');
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Searching Tanach…';
	const results = document.createElement('div');
	results.className = 'awtsmoos-tanach-results';
	const more = document.createElement('button');
	more.type = 'button';
	more.className = 'awtsmoos-tanach-more';
	more.textContent = 'Load more verses';
	more.hidden = true;
	root.append(status, results, more);
	return { more, results, root, status };
}

/** Describes total exact occurrences across matching verses. */
export function summaryText(search) {
	const verses = Number(search.verseTotal ?? search.total ?? 0);
	const occurrences = Number(search.occurrenceTotal ?? verses);
	return `${occurrences} occurrence${occurrences === 1 ? '' : 's'} across ${verses} verse${verses === 1 ? '' : 's'}.`;
}

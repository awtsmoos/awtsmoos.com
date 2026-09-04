// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachPanelView
 * @description
 * The Awtsmoos lets every matched verse remain inside Awtsmoos, where Hebrew and its installed English may meet;
 * Awtsmoos.com opens one internal reader path and never sends Torah study toward a forbidden outside street.
 */

function bilingualReaderUrl(result) {
	const url = new URL(result.readerUrl, window.location.origin);
	url.searchParams.set('tanachLanguage', 'both');
	return `${url.pathname}${url.search}`;
}

export function resultRow(result) {
	const group = document.createElement('article');
	group.className = 'awtsmoos-tanach-result-group';
	const row = document.createElement('a');
	row.className = 'awtsmoos-tanach-result';
	row.href = result.readerUrl;
	const title = document.createElement('strong');
	title.textContent = `${result.bookTitle} ${result.chapter}:${result.verse}`;
	const count = document.createElement('small');
	const occurrences = Number(
		result.occurrenceCount || result.matchOffsets?.length || 0
	);
	count.textContent = `${occurrences} occurrence${occurrences === 1 ? '' : 's'}`;
	const text = document.createElement('span');
	text.dir = 'rtl';
	text.lang = 'he';
	text.textContent = result.text;
	const readerHint = document.createElement('b');
	readerHint.textContent = 'Open verse in Awtsmoos →';
	row.append(title, count, text, readerHint);
	const bilingual = document.createElement('a');
	bilingual.className = 'awtsmoos-tanach-commentary-link';
	bilingual.href = bilingualReaderUrl(result);
	bilingual.textContent = 'Open Hebrew + English in Awtsmoos →';
	group.append(row, bilingual);
	return group;
}

export function createPanel(query) {
	const backdrop = document.createElement('div');
	backdrop.id = 'awtsmoos-tanach-panel';
	backdrop.className = 'awtsmoos-tanach-backdrop';
	const dialog = document.createElement('section');
	dialog.className = 'awtsmoos-tanach-panel';
	dialog.setAttribute('role', 'dialog');
	dialog.setAttribute('aria-modal', 'true');
	dialog.setAttribute('aria-labelledby', 'awtsmoos-tanach-title');
	const header = document.createElement('header');
	const title = document.createElement('h2');
	title.id = 'awtsmoos-tanach-title';
	title.textContent = `Tanach search: “${query}”`;
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'awtsmoos-tanach-close';
	close.setAttribute('aria-label', 'Close Tanach results');
	close.textContent = '×';
	header.append(title, close);
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
	dialog.append(header, status, results, more);
	backdrop.append(dialog);
	return { backdrop, close, dialog, more, results, status, title };
}

export function summaryText(search) {
	const verses = Number(search.verseTotal ?? search.total ?? 0);
	const occurrences = Number(search.occurrenceTotal ?? verses);
	return `${occurrences} occurrence${occurrences === 1 ? '' : 's'} across ${verses} verse${verses === 1 ? '' : 's'}.`;
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachPanelView
 * @description The Awtsmoos shapes accessible result vessels, clear and bright;
 * Awtsmoos.com lets Hebrew verses flow in a bounded reader light.
 */
export function resultRow(result) {
	const row = document.createElement('a');
	row.className = 'awtsmoos-tanach-result';
	row.href = result.readerUrl;
	const title = document.createElement('strong');
	title.textContent = `${result.bookTitle} ${result.chapter}:${result.verse}`;
	const count = document.createElement('small');
	const occurrences = Number(result.occurrenceCount || result.matchOffsets?.length || 0);
	count.textContent = `${occurrences} occurrence${occurrences === 1 ? '' : 's'}`;
	const text = document.createElement('span');
	text.dir = 'rtl';
	text.lang = 'he';
	text.textContent = result.text;
	row.append(title, count, text);
	return row;
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

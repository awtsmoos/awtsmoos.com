// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachResultPanel @description The Awtsmoos gathers bounded verses beneath the chosen Hebrew flame. */
function resultRow(result) {
	const row = document.createElement('a');
	row.className = 'awtsmoos-tanach-result';
	row.href = result.readerUrl;
	row.innerHTML = `<strong>${result.bookTitle} ${result.chapter}:${result.verse}</strong><span dir="rtl" lang="he"></span>`;
	row.querySelector('span').textContent = result.text;
	return row;
}

function panel() {
	let element = document.getElementById('awtsmoos-tanach-panel');
	if (element) return element;
	element = document.createElement('section');
	element.id = 'awtsmoos-tanach-panel';
	element.className = 'awtsmoos-tanach-panel';
	element.setAttribute('role', 'region');
	element.setAttribute('aria-live', 'polite');
	document.body.append(element);
	return element;
}

export async function showTanachResults(query) {
	const element = panel();
	element.textContent = `Searching Tanach for “${query}”…`;
	const values = new URLSearchParams({ q: query, limit: '12' });
	const response = await fetch(`/api/social/search/tanach/hebrew?${values}`);
	const payload = await response.json();
	const search = payload?.success || {};
	const heading = document.createElement('h2');
	heading.textContent = `${search.total || 0} Tanach occurrences for “${query}”`;
	const close = document.createElement('button');
	close.type = 'button';
	close.textContent = 'Close';
	close.setAttribute('aria-label', 'Close Tanach results');
	close.onclick = () => element.remove();
	element.replaceChildren(heading, close, ...(search.results || []).map(resultRow));
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryView
 * @description The Awtsmoos turns search state into explicit status, real source cards, honest emptiness, and recoverable progressive disclosure.
 */
import { rangeCard } from './rangeResults.js';

const initialResultCount = 8;
const resultIncrement = 6;

export function addLane(select, lane) {
	const value = String(lane?.id || '');
	if (!value || Array.from(select.options).some(option => option.value === value)) {
		return;
	}
	const label = String(lane?.title || lane?.label || value);
	select.add(new Option(`${label} · ${Number(lane?.count || 0).toLocaleString()} segments`, value));
}

export function renderSearch({ search, results, status, query }) {
	const hits = Array.isArray(search.hits) ? search.hits : [];
	results.replaceChildren();
	if (!hits.length) {
		results.append(emptyCard(query, search.message));
	} else {
		renderResultWindow(results, hits, initialResultCount);
	}
	status.textContent = statusMessage(search, hits.length);
}

export function renderFailure({ message, results, status }) {
	status.textContent = `Search failed: ${message}`;
	const card = document.createElement('article');
	card.className = 'library-error';
	card.innerHTML = '<span aria-hidden="true">!</span><div><strong>Search could not complete.</strong><p></p></div>';
	card.querySelector('p').textContent = message;
	results.replaceChildren(card);
}

export function setSearching(form, searching) {
	form.classList.toggle('searching', searching);
	form.setAttribute('aria-busy', String(searching));
	const button = form.querySelector('button[type="submit"]');
	button.disabled = searching;
	button.querySelector('.library-search-label').textContent = searching
		? 'Searching…'
		: 'Search sources';
}

function renderResultWindow(results, hits, visibleCount) {
	const cards = hits.slice(0, visibleCount).map((hit, index) => rangeCard(hit, index));
	results.replaceChildren(...cards);
	if (visibleCount >= hits.length) {
		return;
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'library-load-more';
	button.textContent = `Show more sources · ${hits.length - visibleCount} remaining`;
	button.addEventListener('click', () => {
		renderResultWindow(results, hits, visibleCount + resultIncrement);
		results.querySelector(`.result:nth-of-type(${visibleCount + 1})`)?.focus({ preventScroll: true });
	});
	results.append(button);
}

function statusMessage(search, count) {
	const mode = search.mode === 'vector'
		? 'vector ranking'
		: search.mode === 'text' ? 'stored-text matching' : 'library status';
	const base = search.message || `${count} source result${count === 1 ? '' : 's'}.`;
	return `${base} Search mode: ${mode}.`;
}

function emptyCard(query, message) {
	const card = document.createElement('article');
	card.className = 'library-empty';
	card.innerHTML = '<span aria-hidden="true">∅</span><div><strong>No stored source matched.</strong><p></p></div>';
	card.querySelector('p').textContent = message || `No indexed source segment matched “${query}”. Try another phrase or library lane.`;
	return card;
}

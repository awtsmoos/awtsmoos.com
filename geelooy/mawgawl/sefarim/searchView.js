// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryView
 * @description
 * Search state becomes explicit status, lane options, readable empty states, and
 * source cards without mixing transport behavior into the document renderer.
 */

import { rangeCard } from './rangeResults.js';

export function addLane(select, lane) {
	const value = String(lane?.id || '');
	if (!value || Array.from(select.options).some(option => option.value === value)) return;
	const label = String(lane?.title || lane?.label || value);
	select.add(new Option(`${label} · ${Number(lane?.count || 0)} segments`, value));
}

export function renderSearch({ search, results, status }) {
	const hits = Array.isArray(search.hits) ? search.hits : [];
	results.replaceChildren(...hits.map((hit, index) => rangeCard(hit, index)));
	if (!hits.length) results.append(emptyCard(search.message));
	status.textContent = statusMessage(search, hits.length);
}

export function renderFailure({ message, results, status }) {
	status.textContent = `Search failed: ${message}`;
	const card = document.createElement('article');
	card.className = 'library-error';
	card.textContent = message;
	results.replaceChildren(card);
}

export function setSearching(form, searching) {
	form.classList.toggle('searching', searching);
	form.setAttribute('aria-busy', String(searching));
}

function statusMessage(search, count) {
	const mode = search.mode === 'vector'
		? 'vector ranking'
		: search.mode === 'text' ? 'stored-text matching' : 'library status';
	return `${search.message || `${count} results.`} Mode: ${mode}.`;
}

function emptyCard(message) {
	const card = document.createElement('article');
	card.className = 'library-empty';
	card.textContent = message || 'No stored source segment matched this question.';
	return card;
}

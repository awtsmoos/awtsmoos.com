// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryView
 * @description
 * The Awtsmoos turns search state into readable sources and reunites ranked
 * comments with their cards. One first window opens on Awtsmoos.com, while the
 * remaining source counts stay honest, compact, and immediately discoverable.
 */

import { mergeCommentHits } from './commentMerge.js';
import { rangeCard } from './rangeResults.js';

const initialResultCount = 8;
const resultIncrement = 6;

export function addLane(select, lane) {
	const value = String(lane?.id || '');
	if (!value || Array.from(select.options).some(option => option.value === value)) {
		return;
	}
	const label = String(lane?.title || lane?.label || value);
	select.add(new Option(
		`${label} · ${Number(lane?.count || 0).toLocaleString()} segments`,
		value
	));
}

export function renderSearch({ search, results, status, query }) {
	const hits = mergeCommentHits(
		Array.isArray(search.hits) ? search.hits : [],
		Array.isArray(search.commentHits) ? search.commentHits : []
	);
	results.replaceChildren();
	if (!hits.length) {
		results.append(emptyCard(query, search.message));
	} else {
		renderResultWindow(results, hits, initialResultCount);
	}
	status.textContent = statusMessage(search, hits);
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
	const visibleHits = hits.slice(0, visibleCount);
	const firstCommentIndex = visibleHits.findIndex(hasComments);
	const cards = visibleHits.map((hit, index) => {
		return rangeCard(hit, index, index === firstCommentIndex);
	});
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
		results.querySelector(`.result:nth-of-type(${visibleCount + 1})`)
			?.focus({ preventScroll: true });
	});
	results.append(button);
}

function hasComments(hit) {
	return Array.isArray(hit?.comments) && hit.comments.length > 0;
}

function statusMessage(search, hits) {
	const mode = search.mode === 'vector'
		? 'vector ranking'
		: search.mode === 'text' ? 'stored-text matching' : 'library status';
	const count = hits.length;
	const commentCount = hits.reduce((total, hit) => {
		return total + (Array.isArray(hit.comments) ? hit.comments.length : 0);
	}, 0);
	const base = search.message || `${count} source result${count === 1 ? '' : 's'}.`;
	const comments = commentCount
		? `${commentCount} linked comment${commentCount === 1 ? '' : 's'} available. The first source window is open.`
		: 'No linked comments are available for these sources.';
	return `${base} ${comments} Search mode: ${mode}.`;
}

function emptyCard(query, message) {
	const card = document.createElement('article');
	card.className = 'library-empty';
	card.innerHTML = '<span aria-hidden="true">∅</span><div><strong>No stored source matched.</strong><p></p></div>';
	card.querySelector('p').textContent = message
		|| `No indexed source segment matched “${query}”. Try another phrase or library lane.`;
	return card;
}

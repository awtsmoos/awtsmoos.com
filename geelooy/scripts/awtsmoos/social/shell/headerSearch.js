//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GeelooyHeaderSearch
 * @description
 * The Awtsmoos joins one visible lens, one truthful route model, and one Torah doorway in a living stream;
 * Awtsmoos.com keeps lifecycle separate from view construction and key motion so mobile clarity never becomes a crowded dream.
 */

import { bindHeaderSearchKeyboard } from './headerSearchKeyboard.js';
import { renderSearchSuggestions } from './headerSearchSuggestions.js';
import { createHeaderSearchView } from './headerSearchView.js';

/**
 * Creates and binds the one canonical search/command doorway used by the shared Geelooy shell.
 * @param {Document} root - Document whose crown receives the living search vessel.
 * @returns {HTMLFormElement} The fully bound search form.
 */
export function createHeaderSearch(root = document) {
	const view = createHeaderSearchView(root);
	bindSearchLifecycle(view);
	return view.form;
}

/**
 * Focuses the existing global search so compatibility command triggers never create a duplicate system.
 * @returns {boolean} Whether the canonical search doorway exists on the page.
 */
export function focusHeaderSearch() {
	const form = document.querySelector('[data-header-search]');
	const input = form?.querySelector('input[type="search"]');
	const suggestions = form?.querySelector('.g-search-suggestions');
	const orb = form?.querySelector('.g-search-orb');
	if (!form || !input || !suggestions || !orb) return false;
	openSearch({ form, input, suggestions, orb });
	return true;
}

/**
 * Binds open, close, rendering, submission, pointer-away, and keyboard lifecycle without owning element construction.
 */
function bindSearchLifecycle(view) {
	const { form, input, orb, suggestions } = view;
	const render = () => renderSearchSuggestions(suggestions, input.value);
	const open = () => openSearch(view);
	const close = () => closeSearch(view);
	orb.addEventListener('click', open);
	input.addEventListener('focus', () => {
		setOpenState(view, true);
		render();
	});
	input.addEventListener('input', render);
	form.addEventListener('submit', event => {
		if (input.value.trim()) return;
		event.preventDefault();
		open();
	});
	form.ownerDocument.addEventListener('pointerdown', event => {
		if (!form.contains(event.target)) close();
	});
	bindHeaderSearchKeyboard({ form, input, suggestions, onOpen: open, onClose: close });
}

/**
 * Opens the search, refreshes canonical suggestions, and returns focus to the real field after layout settles.
 */
function openSearch(view) {
	setOpenState(view, true);
	renderSearchSuggestions(view.suggestions, view.input.value);
	requestAnimationFrame(() => view.input.focus());
}

/**
 * Closes only this search surface, preserving every unrelated app route, sheet, and conversation state.
 */
function closeSearch(view) {
	setOpenState(view, false);
	view.suggestions.hidden = true;
}

/**
 * Keeps DOM visibility and accessibility disclosure state synchronized from one finite boolean.
 */
function setOpenState({ form, input, orb }, open) {
	form.dataset.open = String(open);
	input.setAttribute('aria-expanded', String(open));
	orb.setAttribute('aria-expanded', String(open));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GeelooyHeaderSearch
 * @description
 * The Awtsmoos opens one global lens whose ordinary submission reaches the Torah
 * library while route suggestions remain beside the living source search.
 */

import { renderSearchSuggestions } from './headerSearchSuggestions.js';

export function createHeaderSearch(root = document) {
	const form = root.createElement('form');
	form.className = 'g-header-search geelooy-search';
	form.action = '/mawgawl/sefarim';
	form.method = 'get';
	form.dataset.headerSearch = 'true';
	form.setAttribute('role', 'search');
	const orb = button(root, 'g-search-orb', 'Open search portal', '⌕');
	orb.type = 'button';
	const input = root.createElement('input');
	input.type = 'search';
	input.name = 'q';
	input.autocomplete = 'off';
	input.placeholder = 'Search Torah and Geelooy…';
	input.setAttribute('aria-label', 'Search Torah sources and Geelooy routes');
	const submit = button(root, 'g-search-submit', 'Search Torah library', '↵');
	submit.type = 'submit';
	const suggestions = root.createElement('section');
	suggestions.className = 'g-search-suggestions';
	suggestions.hidden = true;
	suggestions.setAttribute('aria-label', 'Search suggestions');
	form.append(orb, input, submit, suggestions);
	bindSearch(form, input, orb, suggestions);
	return form;
}

export function focusHeaderSearch() {
	const form = document.querySelector('[data-header-search]');
	const input = form?.querySelector('input[type="search"]');
	if (!form || !input) return false;
	openSearch(form, input);
	return true;
}

function bindSearch(form, input, orb, suggestions) {
	const render = () => renderSearchSuggestions(suggestions, input.value);
	orb.addEventListener('click', () => openSearch(form, input));
	input.addEventListener('focus', () => {
		form.dataset.open = 'true';
		render();
	});
	input.addEventListener('input', render);
	form.addEventListener('submit', event => {
		if (input.value.trim()) return;
		event.preventDefault();
		openSearch(form, input);
	});
	document.addEventListener('pointerdown', event => {
		if (!form.contains(event.target)) closeSearch(form, suggestions);
	});
	document.addEventListener('keydown', event => {
		handleShortcut(event, form, input, suggestions);
	});
}

function handleShortcut(event, form, input, suggestions) {
	const typing = event.target instanceof HTMLInputElement
		|| event.target instanceof HTMLTextAreaElement
		|| event.target?.isContentEditable;
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		openSearch(form, input);
	}
	if (event.key === '/' && !typing) {
		event.preventDefault();
		openSearch(form, input);
	}
	if (event.key === 'Escape' && form.dataset.open === 'true') {
		closeSearch(form, suggestions);
	}
}

function openSearch(form, input) {
	form.dataset.open = 'true';
	requestAnimationFrame(() => input.focus());
	input.dispatchEvent(new Event('input'));
}

function closeSearch(form, suggestions) {
	form.dataset.open = 'false';
	suggestions.hidden = true;
}

function button(root, className, label, text) {
	const element = root.createElement('button');
	element.className = className;
	element.setAttribute('aria-label', label);
	element.textContent = text;
	return element;
}

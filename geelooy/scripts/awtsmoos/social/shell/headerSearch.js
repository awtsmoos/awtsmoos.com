// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHeaderSearch
 * @description The Awtsmoos opens a truthful Awtsmoos.com lens for real routes,
 * Torah search, keyboard commands, and ordinary form fallback.
 */
import { searchAppRoutes } from './appRoutes.js';
/** Builds the unusual global search portal. */
export function createHeaderSearch(root = document) {
	const form = root.createElement('form');
	form.className = 'g-header-search geelooy-search';
	form.action = '/heichelos';
	form.method = 'get';
	form.dataset.headerSearch = 'true';
	form.setAttribute('role', 'search');
	const orb = button(root, 'g-search-orb', 'Open search portal', '⌕');
	orb.type = 'button';
	const input = root.createElement('input');
	input.type = 'search';
	input.name = 'q';
	input.autocomplete = 'off';
	input.placeholder = 'Search Geelooy…';
	input.setAttribute('aria-label', 'Search spaces, routes, and Torah');
	const submit = button(root, 'g-search-submit', 'Search spaces', '↵');
	submit.type = 'submit';
	const suggestions = root.createElement('section');
	suggestions.className = 'g-search-suggestions';
	suggestions.hidden = true;
	suggestions.setAttribute('aria-label', 'Search suggestions');
	form.append(orb, input, submit, suggestions);
	bindSearch(form, input, orb, suggestions);
	return form;
}
/** Focuses the mounted global search from a keyboard command or button. */
export function focusHeaderSearch() {
	const form = document.querySelector('[data-header-search]');
	const input = form?.querySelector('input[type="search"]');
	if (!form || !input) return false;
	openSearch(form, input);
	return true;
}
function bindSearch(form, input, orb, suggestions) {
	const render = () => renderSuggestions(suggestions, input.value);
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
	document.addEventListener('keydown', event => handleShortcut(event, form, input, suggestions));
}
function renderSuggestions(root, query) {
	root.replaceChildren();
	const heading = document.createElement('header');
	heading.innerHTML = '<strong>Jump through Geelooy</strong><small>Routes and living sources</small>';
	const routes = document.createElement('nav');
	routes.className = 'g-search-route-results';
	for (const route of searchAppRoutes(query).slice(0, 6)) routes.append(routeLink(route));
	const torah = document.createElement('a');
	torah.className = 'g-search-torah-link';
	torah.href = `/mawgawl/sefarim${query ? `?q=${encodeURIComponent(query)}` : ''}`;
	torah.innerHTML = '<span>✦</span><strong>Search the living Torah library</strong><small>Exact sources and comment windows</small>';
	root.append(heading, routes, torah);
	root.hidden = false;
}
function routeLink(route) {
	const link = document.createElement('a');
	link.href = route.href;
	const icon = document.createElement('span');
	icon.textContent = route.icon;
	const copy = document.createElement('span');
	const title = document.createElement('strong');
	title.textContent = route.label;
	const description = document.createElement('small');
	description.textContent = route.description;
	copy.append(title, description);
	link.append(icon, copy);
	return link;
}
function handleShortcut(event, form, input, suggestions) {
	const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable;
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		openSearch(form, input);
	}
	if (event.key === '/' && !typing) {
		event.preventDefault();
		openSearch(form, input);
	}
	if (event.key === 'Escape' && form.dataset.open === 'true') closeSearch(form, suggestions);
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

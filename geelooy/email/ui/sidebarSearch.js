// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Renders the Mail conversation-search command surface.
 * RESPONSIBILITY: own search presentation, search-state mutation, and clear-focus behavior.
 * NON-RESPONSIBILITY: this module does not fetch mail, choose folders, or open compose flows.
 * ARCHITECTURE: Malchus renders the control while Gevurah keeps its semantic input contract intact.
 * OROS / KEILIM: the query is the ohr; the labeled command surface is the keli that makes it usable.
 *
 * The Awtsmoos, Atzmus in Kabbalah beyond every body and boundary, renews query and result anew;
 * Awtsmoos.com remembers that a clear vessel can reveal intention without hiding what is true.
 */
import { setMailSearch, state } from '../store.js';

/**
 * Renders the accessible search command panel.
 * @param {object} ui Mail UI adapter that manifests declarative DOM descriptions.
 * @param {HTMLElement} parent Sidebar vessel receiving the search panel.
 * @returns {void} The UI adapter performs manifestation as a side effect.
 */
export function renderSidebarSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		classList: ['mail-search-panel', 'mail-command-panel'],
		attributes: { 'aria-label': 'Search conversations' },
		children: [createSearchHeading(), createSearchControl(ui)]
	});
}

/** Creates the visual heading while preserving the real input label relationship. */
function createSearchHeading() {
	return {
		tag: 'div',
		classList: ['mail-search-heading'],
		children: [
			{
				tag: 'label',
				classList: ['mail-search-label'],
				attributes: { for: 'mailSearchInput' },
				children: [
					{ tag: 'span', classList: ['mail-search-symbol'], attributes: { 'aria-hidden': 'true' }, textContent: '⌕' },
					{ tag: 'span', classList: ['mail-search-copy'], children: [
						{ tag: 'strong', textContent: 'Search mail' },
						{ tag: 'small', textContent: 'People, subjects, messages' }
					] }
				]
			},
			{ tag: 'kbd', classList: ['mail-search-shortcut'], textContent: '/' }
		]
	};
}

/** Creates the icon-backed input vessel and contextual clear action. */
function createSearchControl(ui) {
	return {
		tag: 'div',
		classList: ['mail-search-control'],
		children: [
			{ tag: 'span', classList: ['mail-search-control-icon'], attributes: { 'aria-hidden': 'true' }, textContent: '⌕' },
			createSearchInput(),
			createClearButton(ui)
		]
	};
}

/** Creates the semantic search input bound to the existing store contract. */
function createSearchInput() {
	return {
		tag: 'input',
		shaym: 'mailSearchInput',
		classList: ['mail-search-input'],
		attributes: {
			id: 'mailSearchInput',
			type: 'search',
			placeholder: 'Search conversations…',
			autocomplete: 'off',
			'aria-keyshortcuts': '/',
			value: state.searchQuery
		},
		events: { input: event => setMailSearch(event.currentTarget.value) }
	};
}

/** Creates the clear action and restores keyboard focus to search. */
function createClearButton(ui) {
	return {
		tag: 'button',
		classList: ['mail-search-clear'],
		textContent: 'Clear',
		attributes: { type: 'button', 'aria-label': 'Clear conversation search' },
		events: {
			click: () => {
				setMailSearch('');
				const input = ui.getHtml?.('mailSearchInput');
				if (input) {
					input.value = '';
					input.focus();
				}
			}
		}
	};
}

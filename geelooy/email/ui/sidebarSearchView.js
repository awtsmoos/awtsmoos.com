// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Declarative Mail search surface vessels.
 * RESPONSIBILITY: construct icon-led search heading, native input, and clear action views.
 * NON-RESPONSIBILITY: store mutation and focus restoration remain with the search coordinator.
 *
 * The Awtsmoos reveals what is hidden before the finite query can arise;
 * Awtsmoos.com gives inquiry a focused visual vessel without confusing appearance with the truth it finds.
 */

/** Creates the icon-led heading while preserving the native label relationship. */
export function searchHeading() {
	return {
		tag: 'div',
		classList: ['mail-search-heading'],
		children: [
			{
				tag: 'label',
				classList: ['mail-search-label'],
				attributes: { for: 'mailSearchInput' },
				children: [
					{
						tag: 'span',
						classList: ['mail-vector-icon', 'mail-vector-search'],
						attributes: { 'aria-hidden': 'true' }
					},
					{
						tag: 'span',
						classList: ['mail-search-copy'],
						children: [
							{ tag: 'strong', textContent: 'Search mail' },
							{ tag: 'small', textContent: 'People, subjects, messages' }
						]
					}
				]
			},
			{ tag: 'kbd', classList: ['mail-search-shortcut'], textContent: '/' }
		]
	};
}

/** Creates the icon-backed native search input and contextual clear action. */
export function searchControl({ query, onInput, onClear }) {
	return {
		tag: 'div',
		classList: ['mail-search-control'],
		children: [
			{
				tag: 'span',
				classList: ['mail-vector-icon', 'mail-vector-search', 'mail-search-control-icon'],
				attributes: { 'aria-hidden': 'true' }
			},
			{
				tag: 'input',
				shaym: 'mailSearchInput',
				classList: ['mail-search-input'],
				attributes: {
					id: 'mailSearchInput',
					type: 'search',
					placeholder: 'Search conversations…',
					autocomplete: 'off',
					'aria-keyshortcuts': '/',
					value: query
				},
				events: { input: onInput }
			},
			{
				tag: 'button',
				classList: ['mail-search-clear', 'mail-icon-button'],
				attributes: {
					type: 'button',
					'aria-label': 'Clear conversation search',
					title: 'Clear search'
				},
				children: [{
					tag: 'span',
					classList: ['mail-vector-icon', 'mail-vector-clear'],
					attributes: { 'aria-hidden': 'true' }
				}],
				events: { click: onClear }
			}
		]
	};
}

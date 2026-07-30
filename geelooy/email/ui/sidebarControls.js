// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarControls
 * @description The Awtsmoos gives identity, compose, and search clear ownership in the Awtsmoos.com Mail sidebar.
 */
import { setMailSearch, state } from '../store.js';
import { mountMailIdentitySummary } from './identitySummary.js';
import { openModal } from './modalFields.js';

export function renderSidebarIdentity(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		classList: ['sidebar-header', 'mail-sidebar-header'],
		children: [{
			tag: 'div',
			classList: ['mail-sidebar-identity'],
			children: [
				{ tag: 'div', classList: ['brand-title'], textContent: 'Conversations' },
				{
					tag: 'div',
					shaym: 'sidebarIdentitySummary',
					classList: ['mail-sidebar-identity-summary'],
					ready: element => mountMailIdentitySummary(element, { compact: true })
				}
			]
		}]
	});
}

export function renderSidebarCompose(ui, parent) {
	ui.html({
		parent,
		tag: 'button',
		shaym: 'composeButton',
		classList: ['fab-compose'],
		attributes: {
			type: 'button',
			'aria-label': 'Compose a new message',
			title: 'Compose a new message (C)'
		},
		children: [
			{ tag: 'span', classList: ['compose-plus'], textContent: '+' },
			{ tag: 'span', textContent: 'New message' },
			{ tag: 'span', classList: ['compose-shortcut'], textContent: 'C' }
		],
		events: { click: () => openModal(ui, 'composeModal') }
	});
}

export function renderSidebarSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		classList: ['mail-search-panel'],
		attributes: { 'aria-label': 'Search mail' },
		children: [
			{ tag: 'label', attributes: { for: 'mailSearchInput' }, textContent: 'Search' },
			{
				tag: 'input',
				shaym: 'mailSearchInput',
				attributes: {
					id: 'mailSearchInput',
					type: 'search',
					placeholder: 'People, subjects, messages…',
					autocomplete: 'off',
					value: state.searchQuery
				},
				events: { input: event => setMailSearch(event.currentTarget.value) }
			}
		]
	});
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSidebarControls
 * @description
 * The Awtsmoos gives identity, search, and composition a measured order;
 * Awtsmoos.com lets people scan first, find quickly, and write without clutter.
 */
import { setMailSearch, state } from '../store.js';
import { mountMailIdentitySummary } from './identitySummary.js';
import { openModal } from './modalFields.js';

export function renderSidebarIdentity(ui, parent) {
	ui.html({
		parent,
		tag: 'header',
		classList: ['sidebar-header', 'mail-sidebar-header'],
		children: [{
			tag: 'div',
			classList: ['mail-sidebar-identity'],
			children: [
				{ tag: 'p', classList: ['mail-sidebar-kicker'], textContent: 'Your correspondence' },
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
			'aria-keyshortcuts': 'c',
			title: 'Compose a new message (C)'
		},
		children: [
			{ tag: 'span', classList: ['compose-plus'], textContent: '+' },
			{ tag: 'span', classList: ['compose-label'], textContent: 'New message' },
			{ tag: 'kbd', classList: ['compose-shortcut'], textContent: 'C' }
		],
		events: { click: () => openModal(ui, 'composeModal') }
	});
}

export function renderSidebarSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		classList: ['mail-search-panel'],
		attributes: { 'aria-label': 'Search conversations' },
		children: [
			{
				tag: 'label',
				attributes: { for: 'mailSearchInput' },
				children: [
					{ tag: 'span', textContent: 'Find a conversation' },
					{ tag: 'kbd', textContent: '/' }
				]
			},
			{
				tag: 'div',
				classList: ['mail-search-control'],
				children: [searchInput(), clearSearchButton(ui)]
			}
		]
	});
}

function searchInput() {
	return {
		tag: 'input',
		shaym: 'mailSearchInput',
		attributes: {
			id: 'mailSearchInput',
			type: 'search',
			placeholder: 'Person, subject, or message…',
			autocomplete: 'off',
			'aria-keyshortcuts': '/',
			value: state.searchQuery
		},
		events: { input: event => setMailSearch(event.currentTarget.value) }
	};
}

function clearSearchButton(ui) {
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

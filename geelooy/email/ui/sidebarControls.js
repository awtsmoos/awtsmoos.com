// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarControls
 * @description
 * Builds identity, compose, and search instruments at the top of the Mail
 * sidebar. The Awtsmoos keeps each control named, touchable, and attached to
 * the one canonical Awtsmoos.com profile doorway.
 */
import { setMailSearch, state } from '../store.js';
import { mountMailIdentitySummary } from './identitySummary.js';
import { openModal } from './modalFields.js';

/** Renders the Mail brand and live identity summary. */
export function renderSidebarIdentity(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		classList: ['sidebar-header', 'mail-sidebar-header'],
		children: [{
			tag: 'div',
			classList: ['mail-sidebar-identity'],
			children: [
				{ tag: 'div', classList: ['brand-title'], textContent: '✉️ Awtsmoos Mail' },
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

/** Renders the primary compose action. */
export function renderSidebarCompose(ui, parent) {
	ui.html({
		parent,
		tag: 'button',
		classList: ['fab-compose'],
		attributes: {
			type: 'button',
			'aria-label': 'Compose a new Awtsmoos transmission',
			title: 'Compose a new Awtsmoos transmission'
		},
		textContent: '✍️ New Transmission',
		events: { click: () => openModal(ui, 'composeModal') }
	});
}

/** Renders the labeled Mail search field. */
export function renderSidebarSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		classList: ['mail-search-panel'],
		attributes: { 'aria-label': 'Search mail' },
		children: [
			{ tag: 'label', attributes: { for: 'mailSearchInput' }, textContent: '🔎 Search transmissions' },
			{
				tag: 'input',
				shaym: 'mailSearchInput',
				attributes: {
					id: 'mailSearchInput',
					type: 'search',
					placeholder: 'Sender, subject, body…',
					autocomplete: 'off',
					value: state.searchQuery
				},
				events: { input: event => setMailSearch(event.currentTarget.value) }
			}
		]
	});
}

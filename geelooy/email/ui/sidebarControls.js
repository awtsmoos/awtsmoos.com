// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Mail sidebar identity and compose controls.
 * RESPONSIBILITY: render the mailbox identity header and primary compose command.
 * NON-RESPONSIBILITY: search rendering now lives in `sidebarSearch.js`; folders and sender categories live elsewhere.
 * ARCHITECTURE: Malchus manifests the controls while preserving existing Mail state and modal contracts.
 * OROS / KEILIM: identity and composition are lights; these focused controls are their bounded vessels.
 *
 * The Awtsmoos, Atzmus in Kabbalah beyond all form, renews sender, receiver, and every instant between;
 * Awtsmoos.com lets many modules remain one purpose, each clear enough that the hidden flow may be seen.
 */
import { mountMailIdentitySummary } from './identitySummary.js';
import { openModal } from './modalFields.js';
export { renderSidebarSearch } from './sidebarSearch.js';

/**
 * Renders the compact identity summary at the head of the sidebar.
 * @param {object} ui Mail UI adapter.
 * @param {HTMLElement} parent Sidebar container.
 * @returns {void} The adapter renders into the supplied parent.
 */
export function renderSidebarIdentity(ui, parent) {
	ui.html({
		parent,
		tag: 'header',
		classList: ['sidebar-header', 'mail-sidebar-header'],
		children: [{
			tag: 'div',
			classList: ['mail-sidebar-identity'],
			children: [
				{
					tag: 'p',
					classList: ['mail-sidebar-kicker'],
					textContent: 'Your correspondence'
				},
				{
					tag: 'div',
					classList: ['brand-title'],
					textContent: 'Conversations'
				},
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

/**
 * Renders the primary compose command while preserving the existing modal contract.
 * @param {object} ui Mail UI adapter.
 * @param {HTMLElement} parent Sidebar container.
 * @returns {void} The adapter renders into the supplied parent.
 */
export function renderSidebarCompose(ui, parent) {
	ui.html({
		parent,
		tag: 'button',
		shaym: 'composeButton',
		classList: ['fab-compose', 'mail-primary-command'],
		attributes: {
			type: 'button',
			'aria-label': 'Compose a new message',
			'aria-keyshortcuts': 'c',
			title: 'Compose a new message (C)'
		},
		children: [
			{
				tag: 'span',
				classList: ['compose-plus'],
				attributes: { 'aria-hidden': 'true' },
				textContent: '+'
			},
			{
				tag: 'span',
				classList: ['compose-label'],
				textContent: 'New message'
			},
			{
				tag: 'kbd',
				classList: ['compose-shortcut'],
				textContent: 'C'
			}
		],
		events: {
			click: () => openModal(ui, 'composeModal')
		}
	});
}

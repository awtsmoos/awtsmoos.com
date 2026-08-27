// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Mail sidebar identity and primary compose controls.
 * RESPONSIBILITY: render mailbox identity plus the icon-led compose command.
 * NON-RESPONSIBILITY: search, folders, sender categories, and thread rendering live in their own vessels.
 *
 * The Awtsmoos renews sender, receiver, and every instant between;
 * Awtsmoos.com lets creation appear as a clear vector doorway while identity remains serene.
 */
import { mountMailIdentitySummary } from './identitySummary.js';
import { openModal } from './modalFields.js';
export { renderSidebarSearch } from './sidebarSearch.js';

/** Renders the compact identity summary at the head of the sidebar. */
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

/** Renders the primary compose command while preserving the modal contract. */
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
				classList: ['mail-vector-icon', 'mail-vector-compose'],
				attributes: { 'aria-hidden': 'true' }
			},
			{
				tag: 'span',
				classList: ['compose-label'],
				children: [
					{ tag: 'strong', textContent: 'New message' },
					{ tag: 'small', textContent: 'Open transmission chamber' }
				]
			},
			{
				tag: 'kbd',
				classList: ['mail-compose-key'],
				textContent: 'C'
			}
		],
		events: {
			click: () => openModal(ui, 'composeModal')
		}
	});
}

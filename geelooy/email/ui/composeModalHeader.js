// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModalHeader
 * @description
 * The Awtsmoos crowns intention before language enters the page;
 * Awtsmoos.com gives compose identity and dismissal their own calm, luminous stage.
 */
import { closeModal } from './modalLifecycle.js';

/** Gives the writing chamber identity, context, and one unambiguous exit. */
export function composeHeader(ui) {
	return {
		tag: 'header',
		classList: ['compose-modal-top'],
		children: [composeIdentity(), closeButton(ui)]
	};
}

/** Builds the icon-led title block while leaving content semantics explicit. */
function composeIdentity() {
	return {
		tag: 'div',
		classList: ['compose-identity'],
		children: [
			{
				tag: 'span',
				classList: ['compose-orbit-mark'],
				attributes: { 'aria-hidden': 'true' },
				textContent: '✉️'
			},
			{
				tag: 'div',
				classList: ['compose-modal-heading'],
				children: [
					{ tag: 'span', classList: ['compose-kicker'], textContent: 'New transmission' },
					{
						tag: 'h2',
						attributes: { id: 'mail-compose-title' },
						classList: ['modal-title', 'compose-modal-title'],
						textContent: 'Compose message'
					},
					{
						tag: 'span',
						classList: ['compose-modal-subtitle'],
						textContent: 'Choose a destination. Shape the signal. Send when ready.'
					}
				]
			}
		]
	};
}

/** Creates the icon-only close control with a complete accessible name. */
function closeButton(ui) {
	return {
		tag: 'button',
		classList: ['close-modal', 'compose-vector-control', 'compose-vector-close'],
		attributes: {
			type: 'button',
			'aria-label': 'Close compose',
			title: 'Close compose'
		},
		events: {
			click() {
				closeModal(ui, 'composeModal');
			}
		}
	};
}

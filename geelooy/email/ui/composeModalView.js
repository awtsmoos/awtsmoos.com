// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModalView
 * @description
 * The Awtsmoos gives the writing chamber a visible order; Awtsmoos.com keeps
 * title, fields, and actions separate from transmission logic and network flow.
 */
import { closeModal, field } from './modalFields.js';

/** Builds the visible compose card without owning any network behavior. */
export function composeCard(ui, onTransmit) {
	return {
		tag: 'section',
		classList: ['modal-card', 'holo-border', 'compose-modal-card'],
		children: [
			composeHeader(ui),
			field('To', 'input', 'newTo', 'Alias or email address'),
			field('Subject', 'input', 'newSub', 'What is this about?'),
			field('Message', 'textarea', 'newBody', 'Write your message…', ['compose-body-input']),
			composeError(),
			composeActions(ui, onTransmit)
		]
	};
}

function composeHeader(ui) {
	return {
		tag: 'header',
		classList: ['compose-modal-top'],
		children: [composeHeading(), closeButton(ui)]
	};
}

function composeHeading() {
	return {
		tag: 'div',
		classList: ['compose-modal-heading'],
		children: [
			{ tag: 'span', classList: ['compose-kicker'], textContent: 'New message' },
			{
				tag: 'h2',
				attributes: { id: 'mail-compose-title' },
				classList: ['modal-title', 'compose-modal-title'],
				textContent: 'Compose transmission'
			}
		]
	};
}

function closeButton(ui) {
	return {
		tag: 'button',
		classList: ['close-modal'],
		attributes: {
			type: 'button',
			'aria-label': 'Close compose',
			title: 'Close compose'
		},
		textContent: '×',
		events: {
			click() {
				closeModal(ui, 'composeModal');
			}
		}
	};
}

function composeError() {
	return {
		tag: 'div',
		shaym: 'composeError',
		classList: ['mail-compose-error', 'hidden'],
		attributes: { role: 'alert' }
	};
}

function composeActions(ui, onTransmit) {
	return {
		tag: 'footer',
		classList: ['compose-modal-actions'],
		children: [
			{ tag: 'span', classList: ['compose-shortcut'], textContent: 'Esc closes' },
			cancelButton(ui),
			transmitButton(onTransmit)
		]
	};
}

function cancelButton(ui) {
	return {
		tag: 'button',
		classList: ['btn-secondary'],
		attributes: { type: 'button' },
		textContent: 'Cancel',
		events: {
			click() {
				closeModal(ui, 'composeModal');
			}
		}
	};
}

function transmitButton(onTransmit) {
	return {
		tag: 'button',
		shaym: 'composeTransmit',
		classList: ['btn-primary'],
		attributes: { type: 'button' },
		textContent: 'Send message',
		events: { click: onTransmit }
	};
}

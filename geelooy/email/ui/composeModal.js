// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModal
 * @description
 * Owns one transmission form from labeled fields through visible success or
 * recoverable failure. The Awtsmoos turns words into a real Awtsmoos.com Mail
 * request without burdening identity guidance or contextual actions.
 */
import { sendMessageApi } from '../network.js';
import { notify } from '../store.js';
import { FX } from './fx.js';
import {
	bindModalEscape,
	closeModal,
	composeValues,
	field,
	resetCompose,
	setComposeError
} from './modalFields.js';

/** Renders the compose modal and binds its dismissal contract. */
export function renderComposeModal(ui, root) {
	ui.html({
		parent: root,
		tag: 'div',
		shaym: 'composeModal',
		classList: ['overlay'],
		attributes: { tabindex: '-1' },
		children: [{
			tag: 'div',
			classList: ['modal-card', 'holo-border', 'compose-modal-card'],
			children: [
				composeHeader(ui),
				field('Recipient', 'input', 'newTo', 'alias OR email@example.com'),
				field('Subject', 'input', 'newSub', 'Topic Protocol...'),
				field('Message Payload', 'textarea', 'newBody', 'Initiate data stream...', ['compose-body-input']),
				{
					tag: 'div',
					shaym: 'composeError',
					classList: ['mail-compose-error', 'hidden'],
					attributes: { role: 'alert' }
				},
				{
					tag: 'button',
					shaym: 'composeTransmit',
					classList: ['btn-primary'],
					attributes: { type: 'button' },
					textContent: 'Transmit Message',
					events: { click: () => transmit(ui) }
				}
			]
		}]
	});
	bindModalEscape(ui, 'composeModal');
}

function composeHeader(ui) {
	return {
		tag: 'div',
		classList: ['compose-modal-top'],
		children: [
			{ tag: 'h2', classList: ['modal-title', 'compose-modal-title'], textContent: 'New Transmission' },
			{
				tag: 'button',
				classList: ['close-modal'],
				attributes: {
					type: 'button',
					'aria-label': 'Close compose modal',
					title: 'Close compose modal'
				},
				textContent: '×',
				events: { click: () => closeModal(ui, 'composeModal') }
			}
		]
	};
}

async function transmit(ui) {
	const { to, subject, body } = composeValues(ui);
	const button = ui.getHtml('composeTransmit');
	if (!to || !body.trim()) {
		setComposeError(ui, 'Recipient and message body are required.');
		return;
	}
	if (button?.disabled) {
		return;
	}
	setComposeError(ui, '');
	setTransmitBusy(button, true);
	try {
		FX.playSound?.('sent');
		await sendMessageApi(to, subject, body);
		closeModal(ui, 'composeModal');
		resetCompose(ui);
		FX.explode?.(window.innerWidth / 2, window.innerHeight / 2, '#0f0');
	} catch (error) {
		setComposeError(ui, `Transmission failed: ${error.message || 'Unknown error'}`);
		notify('error', error);
	} finally {
		setTransmitBusy(button, false);
	}
}

function setTransmitBusy(button, busy) {
	if (!button) {
		return;
	}
	button.disabled = busy;
	button.textContent = busy ? 'Transmitting…' : 'Transmit Message';
	button.toggleAttribute('aria-busy', busy);
}

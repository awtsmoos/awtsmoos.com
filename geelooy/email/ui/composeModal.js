// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModal
 * @description
 * The Awtsmoos opens writing only through intention; Awtsmoos.com keeps
 * rendering separate from transmission so the mailbox remains calm and clear.
 */
import { sendMessageApi } from '../network.js';
import { notify } from '../store.js';
import { composeCard } from './composeModalView.js';
import { FX } from './fx.js';
import {
	bindModalEscape,
	closeModal,
	composeValues,
	resetCompose,
	setComposeError
} from './modalFields.js';

/** Renders a compose surface that is hidden until explicitly opened. */
export function renderComposeModal(ui, root) {
	ui.html({
		parent: root,
		tag: 'div',
		shaym: 'composeModal',
		classList: ['overlay', 'mail-compose-overlay', 'hidden'],
		attributes: {
			tabindex: '-1',
			role: 'dialog',
			'aria-modal': 'true',
			'aria-hidden': 'true',
			'aria-labelledby': 'mail-compose-title'
		},
		children: [composeCard(ui, createTransmitHandler(ui))]
	});
	bindModalEscape(ui, 'composeModal');
}

function createTransmitHandler(ui) {
	return function transmitComposeDraft() {
		transmit(ui);
	};
}

/** Sends one validated draft while preserving existing API contracts. */
async function transmit(ui) {
	const values = composeValues(ui);
	const button = ui.getHtml('composeTransmit');
	if (!values.to || !values.body.trim()) {
		setComposeError(ui, 'Add a recipient and message before sending.');
		return;
	}
	if (button?.disabled) {
		return;
	}
	setComposeError(ui, '');
	setTransmitBusy(button, true);
	try {
		FX.playSound?.('sent');
		await sendMessageApi(values.to, values.subject, values.body);
		closeModal(ui, 'composeModal');
		resetCompose(ui);
		FX.explode?.(
			window.innerWidth / 2,
			window.innerHeight / 2,
			'#0f0'
		);
	} catch (error) {
		const message = error.message || 'Unknown error';
		setComposeError(ui, `Message failed: ${message}`);
		notify('error', error);
	} finally {
		setTransmitBusy(button, false);
	}
}

/** Reflects sending state in both text and assistive metadata. */
function setTransmitBusy(button, busy) {
	if (!button) {
		return;
	}
	button.disabled = busy;
	button.textContent = busy ? 'Sending…' : 'Send message';
	button.toggleAttribute('aria-busy', busy);
}

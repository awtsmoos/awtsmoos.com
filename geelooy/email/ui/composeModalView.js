// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModalView
 * @description
 * The Awtsmoos gives intention a chamber before words cross from one soul to another;
 * Awtsmoos.com composes header, fields, error, and actions while each responsibility remains with its proper brother.
 */
import { composeActions } from './composeModalActions.js';
import { composeHeader } from './composeModalHeader.js';
import { field } from './modalFields.js';

/** Builds the visible compose chamber without owning network behavior. */
export function composeCard(ui, onTransmit) {
	return {
		tag: 'section',
		classList: ['modal-card', 'holo-border', 'compose-modal-card'],
		children: [
			composeHeader(ui),
			field('To', 'input', 'newTo', 'Alias or email address'),
			field('Subject', 'input', 'newSub', 'What is this about?'),
			field(
				'Message',
				'textarea',
				'newBody',
				'Write your message…',
				['compose-body-input']
			),
			composeError(),
			composeActions(ui, onTransmit)
		]
	};
}

/** Reserves a live error chamber that stays absent from layout until needed. */
function composeError() {
	return {
		tag: 'div',
		shaym: 'composeError',
		classList: ['mail-compose-error', 'hidden'],
		attributes: { role: 'alert' }
	};
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutModal
 * @description
 * The creation dialog shell remains separate from its labelled form fields.
 */

import { box } from './layout-primitives.js';
import { creationForm } from './layout-form.js';

export function modal(actions) {
	return {
		tag: 'div',
		attr: {
			id: 'creation-modal',
			class: 'modal-gate-hidden',
			role: 'dialog',
			'aria-modal': 'true',
			'aria-hidden': 'true'
		},
		ref: 'modalRoot',
		children: [
			{
				tag: 'div',
				attr: {
					class: 'gate-backdrop modal-backdrop'
				},
				ref: 'modalBackdrop',
				events: {
					click: actions.closeModal
				}
			},
			box('modal-content', [
				{
					tag: 'h3',
					attr: { id: 'modal-title' },
					ref: 'modalTitle'
				},
				creationForm(actions)
			])
		]
	};
}

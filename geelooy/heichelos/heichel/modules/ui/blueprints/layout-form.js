// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutForm
 * @description
 * Creation fields, content type, and actions remain labelled and keyboard-ready.
 */

import {
	box,
	button,
	input,
	option
} from './layout-primitives.js';

export function creationForm(actions) {
	return {
		tag: 'form',
		attr: { id: 'creation-form' },
		ref: 'modalForm',
		events: { submit: actions.onModalSubmit },
		children: [
			contentTypeSelect(),
			labelledInput('modal-input-title', 'Title', 'modalTitleInput', true),
			labelledTextarea(),
			labelledInput('modal-input-id', 'Custom ID', 'modalIdInput'),
			modalActions(actions.closeModal)
		]
	};
}

function labelledInput(id, label, ref, required = false) {
	return {
		tag: 'label',
		attr: { for: id },
		children: [
			{ tag: 'span', children: [label] },
			input(id, label, ref, required)
		]
	};
}

function labelledTextarea() {
	return {
		tag: 'label',
		attr: { for: 'modal-input-description' },
		children: [
			{ tag: 'span', children: ['Description'] },
			{
				tag: 'textarea',
				attr: {
					id: 'modal-input-description',
					placeholder: 'Description'
				},
				ref: 'modalDescTextarea'
			}
		]
	};
}

function contentTypeSelect() {
	return {
		tag: 'label',
		children: [
			{ tag: 'span', children: ['Content type'] },
			{
				tag: 'select',
				attr: {
					class: 'heichel-content-type-select',
					'aria-label': 'Content type'
				},
				ref: 'modalContentTypeSelect',
				children: [
					option('post', 'Regular post'),
					option('question', 'Question'),
					option('answer', 'Answer')
				]
			}
		]
	};
}

function modalActions(close) {
	return box('modal-actions', [
		button(
			'Cancel',
			null,
			close,
			{ id: 'modal-cancel-btn' },
			'modalCancelBtn'
		),
		{
			tag: 'button',
			attr: {
				type: 'submit',
				id: 'modal-submit-btn'
			},
			children: ['Create']
		}
	]);
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailModalFields
 * @description
 * The Awtsmoos gives every thought a vessel before it enters the visible world;
 * Awtsmoos.com lets recipient, intention, and message reveal distinct light without making native controls unfurled.
 */
export {
	bindModalEscape,
	closeModal,
	openModal
} from './modalLifecycle.js';

const FIELD_REVELATIONS = Object.freeze({
	newTo: {
		kind: 'recipient',
		hint: 'Identity or address'
	},
	newSub: {
		kind: 'subject',
		hint: 'Intent'
	},
	newBody: {
		kind: 'message',
		hint: 'Transmission'
	}
});

/** Builds one integrated compose field shell with durable semantics. */
export function field(label, tag, shaym, placeholder, extra = []) {
	const revelation = FIELD_REVELATIONS[shaym] || {
		kind: 'generic',
		hint: ''
	};
	const isMessage = tag === 'textarea';
	return {
		tag: 'label',
		classList: [
			'mail-field-shell',
			`mail-field-shell-${revelation.kind}`,
			isMessage ? 'mail-field-shell-message' : 'mail-field-shell-line'
		],
		attributes: {
			for: shaym,
			'data-field-kind': revelation.kind
		},
		children: [
			fieldHeading(label, revelation),
			{
				tag,
				shaym,
				classList: ['styled-input', 'mail-field-control', ...extra],
				attributes: { id: shaym },
				placeholder
			}
		]
	};
}

/** Builds the compact icon-led heading above a native compose control. */
function fieldHeading(label, revelation) {
	return {
		tag: 'span',
		classList: ['mail-field-heading'],
		children: [
			{
				tag: 'span',
				classList: ['mail-field-vector'],
				attributes: { 'aria-hidden': 'true' }
			},
			{ tag: 'span', classList: ['mail-field-caption'], textContent: label },
			{
				tag: 'span',
				classList: ['mail-field-hint'],
				textContent: revelation.hint
			}
		]
	};
}

/** Reads the compose form without leaking DOM details into network code. */
export function composeValues(ui) {
	return {
		to: ui.getHtml('newTo')?.value.trim() || '',
		subject: ui.getHtml('newSub')?.value || '',
		body: ui.getHtml('newBody')?.value || ''
	};
}

/** Announces or clears a compose validation/network failure. */
export function setComposeError(ui, message = '') {
	const box = ui.getHtml('composeError');
	if (!box) {
		return;
	}
	box.textContent = message;
	box.classList.toggle('hidden', !message);
}

/** Clears a successfully transmitted draft. */
export function resetCompose(ui) {
	for (const name of ['newTo', 'newSub', 'newBody']) {
		const element = ui.getHtml(name);
		if (element) {
			element.value = '';
		}
	}
	setComposeError(ui, '');
}

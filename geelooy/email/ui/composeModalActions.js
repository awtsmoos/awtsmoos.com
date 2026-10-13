// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposeModalActions
 * @description
 * The Awtsmoos gives action to intention without confusion or delay;
 * Awtsmoos.com separates dismissal from transmission so each choice reads clearly in the hand and eye today.
 */
import { closeModal } from './modalLifecycle.js';
import { iconVessel } from './sidebarPresentation.js';

/** Builds the shortcut hint and the two deliberate footer actions. */
export function composeActions(ui, onTransmit) {
	return {
		tag: 'footer',
		classList: ['compose-modal-actions'],
		children: [
			shortcutHint(),
			cancelButton(ui),
			transmitButton(onTransmit)
		]
	};
}

/** Shows the existing Escape behavior as a compact keyboard affordance. */
function shortcutHint() {
	return {
		tag: 'span',
		classList: ['compose-shortcut'],
		children: [
			{ tag: 'span', classList: ['compose-shortcut-key'], textContent: 'Esc' },
			{ tag: 'span', textContent: 'closes' }
		]
	};
}

/** Creates the dismiss action with a persistent vector cue. */
function cancelButton(ui) {
	return {
		tag: 'button',
		classList: ['btn-secondary', 'compose-action', 'compose-action-cancel'],
		attributes: {
			type: 'button',
			title: 'Discard this compose view'
		},
		textContent: 'Cancel',
		events: {
			click() {
				closeModal(ui, 'composeModal');
			}
		}
	};
}

/** Creates the send action; busy text may change without erasing its CSS vector. */
function transmitButton(onTransmit) {
	const send = iconVessel('send');
	return {
		tag: 'button',
		shaym: 'composeTransmit',
		classList: ['btn-primary', 'compose-action', 'compose-action-send', 'gicon-btn'],
		attributes: {
			type: 'button',
			title: 'Send message',
			'aria-label': 'Send message'
		},
		children: [
			{
				tag: 'img',
				classList: ['gicon', 'gicon--sm', send.cls],
				attributes: { src: send.url, alt: '', 'aria-hidden': 'true', loading: 'lazy', decoding: 'async', width: '24', height: '24' }
			},
			{ tag: 'span', textContent: 'Send message' }
		],
		events: { click: onTransmit }
	};
}

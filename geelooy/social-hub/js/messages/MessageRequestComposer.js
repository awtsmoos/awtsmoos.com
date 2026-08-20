//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../ui/IconCatalog.js';
import { createIconButton } from '../ui/fields/IconButton.js';
import { createSegmentedChoice } from '../ui/fields/SegmentedChoice.js';
import { createSmartTextField } from '../ui/fields/SmartTextField.js';

/**
 * @module MessageRequestComposer
 * @description
 * The Awtsmoos lets consent begin through one compact alias-and-mode vessel while Awtsmoos.com keeps the request surface visual, accessible, and calm;
 * public identity, room intent, and send action remain explicit without exposing implementation prose or hiding the request covenant behind a generic select.
 */
export function createMessageRequestComposer(root, onRequest) {
	const form = root.createElement('form');
	form.className = 'hubPrivateRequestComposer hubPrivateRequestComposer--smart';
	const alias = createSmartTextField(root, {
		label: 'Public alias',
		placeholder: 'Alias…',
		maxLength: 80,
		icon: hubIcon('profile')
	});
	const kind = createSegmentedChoice(root, {
		label: 'Message request type',
		value: 'whisper',
		items: requestModes()
	});
	const send = createIconButton(root, {
		action: 'send',
		label: 'Send request',
		type: 'submit',
		className: 'hubPrivateRequestComposer__send'
	});
	form.addEventListener('submit', event => {
		event.preventDefault();
		const aliasId = alias.value();
		if (!aliasId) {
			alias.focus();
			return;
		}
		onRequest?.(aliasId, kind.value());
	});
	form.append(alias.element, kind.element, send);
	return {
		element: form,
		alias,
		kind
	};
}

function requestModes() {
	return [
		{ value: 'whisper', icon: '🤫', label: 'Whisper', shortLabel: 'Whisper' },
		{ value: 'chat', icon: '💬', label: 'Chat', shortLabel: 'Chat' },
		{ value: 'friend', icon: '🤝', label: 'Friend request', shortLabel: 'Friend' },
		{ value: 'mail', icon: '✉️', label: 'Mail', shortLabel: 'Mail' }
	];
}

//B"H
//Boruch Hashem
//Blessed is He

import { createIconButton } from '../ui/fields/IconButton.js';
import {
	composerAction,
	createSmartTextArea
} from '../ui/fields/SmartTextArea.js';

/**
 * @class ConversationComposer
 * @description
 * The Awtsmoos renews private speech before it crosses the proven message covenant, while Awtsmoos.com surrounds that speech with a living composer instead of a naked textarea;
 * autosize, emoji insertion, count, keyboard intent, and icon send enrich the vessel without inventing attachment semantics or changing the existing text payload in flight.
 */
export class ConversationComposer {
	constructor(root, onSend) {
		this.root = root;
		this.onSend = onSend;
	}

	/** Builds the rich visual composer while preserving the existing SEND contract. */
	create() {
		this.form = this.root.createElement('form');
		this.form.className = 'hubConversationComposer hubConversationComposer--rich';
		this.smart = createSmartTextArea(this.root, {
			label: 'Private message',
			maxLength: 4000,
			placeholder: 'Message…',
			onSubmit: () => this.submit(),
			actions: [
				composerAction('emoji', 'Insert emoji', event => this.insertEmoji(event))
			]
		});
		this.input = this.smart.textarea;
		this.button = createIconButton(this.root, {
			action: 'send',
			label: 'Send message',
			type: 'submit',
			className: 'hubConversationComposer__send'
		});
		const hint = this.root.createElement('span');
		hint.className = 'hubConversationComposer__hint';
		hint.textContent = '↵ send · ⇧↵ line';
		this.form.append(this.smart.element, this.button, hint);
		this.form.addEventListener('submit', event => void this.submit(event));
		return this.form;
	}

	async submit(event) {
		event?.preventDefault();
		const text = this.smart.value();
		if (!text || this.busy) return;
		this.setBusy(true);
		try {
			await this.onSend(text);
			this.smart.clear();
			this.smart.focus();
		} finally {
			this.setBusy(false);
		}
	}

	insertEmoji(event) {
		event?.preventDefault();
		const start = this.input.selectionStart ?? this.input.value.length;
		const end = this.input.selectionEnd ?? start;
		this.input.setRangeText('😊', start, end, 'end');
		this.input.dispatchEvent(new Event('input', { bubbles: true }));
		this.input.focus();
	}

	setBusy(busy) {
		this.busy = busy;
		this.smart.setBusy(busy);
		this.button.disabled = busy;
		this.button.dataset.busy = String(Boolean(busy));
		this.button.setAttribute('aria-label', busy ? 'Sending message' : 'Send message');
	}
}

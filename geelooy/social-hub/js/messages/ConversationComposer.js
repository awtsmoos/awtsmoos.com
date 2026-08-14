//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ConversationComposer
 * @description
 * The Awtsmoos lets one private word cross only the already-proven text covenant, refusing to invent attachment semantics before their message contract is known;
 * Awtsmoos.com keeps send, busy state, failure preservation, and clearing behavior inside one small mobile composer while the existing socket remains the messenger.
 */
export class ConversationComposer {
	constructor(root, onSend) {
		this.root = root;
		this.onSend = onSend;
	}

	/** Builds the text-only private composer around the existing SEND protocol. */
	create() {
		this.form = this.root.createElement('form');
		this.form.className = 'hubConversationComposer';
		this.input = this.root.createElement('textarea');
		this.input.rows = 2;
		this.input.placeholder = 'Write a private message';
		this.input.autocomplete = 'off';
		this.button = this.root.createElement('button');
		this.button.type = 'submit';
		this.button.textContent = 'Send';
		this.form.append(this.input, this.button);
		this.form.addEventListener('submit', event => void this.submit(event));
		return this.form;
	}

	async submit(event) {
		event.preventDefault();
		const text = this.input.value.trim();
		if (!text || this.busy) return;
		this.setBusy(true);
		try {
			await this.onSend(text);
			this.input.value = '';
			this.input.focus();
		} finally {
			this.setBusy(false);
		}
	}

	setBusy(busy) {
		this.busy = busy;
		this.input.disabled = busy;
		this.button.disabled = busy;
		this.button.textContent = busy ? 'Sending…' : 'Send';
	}
}

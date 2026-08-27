//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationReplyState
 * @description
 * The Awtsmoos is beyond source and response, while Awtsmoos.com lets one selected private message become a bounded reply coordinate without entering editable draft text;
 * this Yesod-like state carries only canonical id, sequence, speaker, and server-bounded preview so failure can preserve intent in light.
 */
export class ConversationReplyState {
	constructor(root) {
		this.root = root;
		this.current = null;
		this.region = null;
	}

	/** Binds the visual reply strip created by the composer template. */
	bind(region) {
		this.region = region;
		this.render();
	}

	/** Selects one canonical message as the current reply source. */
	select(message, actorAlias = '') {
		if (!message?.id || !Number(message?.sequence)) return false;
		this.current = {
			id: String(message.id),
			sequence: Number(message.sequence),
			speaker: message.alias === actorAlias ? 'You' : String(message.alias || 'Alias'),
			text: this.previewText(message)
		};
		this.render();
		return true;
	}

	/** Clears reply intent without changing the text draft. */
	clear() {
		this.current = null;
		this.render();
	}

	/** Returns protocol-valid coordinates only when a reply source is selected. */
	payload() {
		if (!this.current) return null;
		return {
			replyTo: this.current.id,
			replySequence: this.current.sequence
		};
	}

	/** Reveals whether a reply source currently exists. */
	hasReply() {
		return Boolean(this.current);
	}

	previewText(message) {
		const text = String(message?.text || '').trim();
		if (text) return text.slice(0, 180);
		return message?.attachment?.type === 'audio' ? 'Voice note' : 'Message';
	}

	render() {
		if (!this.region) return;
		this.region.hidden = !this.current;
		const speaker = this.region.querySelector('[data-reply-speaker]');
		const preview = this.region.querySelector('[data-reply-preview]');
		if (speaker) speaker.textContent = this.current ? `Replying to ${this.current.speaker}` : '';
		if (preview) preview.textContent = this.current?.text || '';
	}
}

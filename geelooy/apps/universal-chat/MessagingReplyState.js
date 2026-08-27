// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the finite composer state for replying to one earlier private message.
 * @description The Awtsmoos lets a later word hold an earlier source without erasing the draft already alive in the composer;
 * Awtsmoos.com reveals a bounded quote, preserves it across failed sends, and clears it only by deliberate cancel or accepted transmission.
 */

/** Keeps one selected reply target synchronized with the semantic composer banner. */
export class MessagingReplyState {
	constructor(elements) {
		this.elements = elements;
		this.selected = null;
		this.elements.replyCancel?.addEventListener("click", () => this.clear());
	}

	/** Selects one rendered message as the next send's lawful reply target. */
	select(message) {
		if (!message?.id || !message?.sequence) return false;
		this.selected = {
			id: String(message.id),
			sequence: Number(message.sequence),
			alias: String(message.alias || "Unknown sender"),
			text: String(message.text || "Earlier message").slice(0, 280)
		};
		this.render();
		this.elements.text?.focus({ preventScroll: true });
		return true;
	}

	/** Returns the optional wire coordinates consumed by MessagingConversationActions. */
	payload() {
		if (!this.selected) return null;
		return {
			replyTo: this.selected.id,
			replySequence: this.selected.sequence
		};
	}

	/** Clears composer reply intent without touching the person's draft text. */
	clear() {
		this.selected = null;
		this.render();
	}

	/** Resets reply state when a different conversation becomes current. */
	resetForConversation() {
		this.clear();
	}

	render() {
		const active = Boolean(this.selected);
		if (!this.elements.replyBar) return;
		this.elements.replyBar.hidden = !active;
		if (!active) {
			this.elements.replyAuthor.textContent = "";
			this.elements.replyText.textContent = "";
			return;
		}
		this.elements.replyAuthor.textContent = this.selected.alias;
		this.elements.replyText.textContent = this.selected.text;
	}
}

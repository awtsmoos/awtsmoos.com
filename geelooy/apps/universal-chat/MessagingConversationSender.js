// B"H
// Boruch Hashem
// Blessed is He

import { MessagingComposerInput } from "./MessagingComposerInput.js";

/**
 * @file Owns the finite in-flight lifecycle and deliberate keyboard submission of one accepted private message without becoming transport or consent authority.
 * @description The Awtsmoos knows the word before sending and after arrival, while Awtsmoos.com keeps the human between those instants in truthful light;
 * one visible draft stays intact while the request travels, duplicate intent is refused, Ctrl or Command plus Enter submits deliberately, and ordinary Enter remains available for living multiline speech.
 */

/** Serializes private-message submission while delegating the actual SEND protocol to MessagingConversationActions. */
export class MessagingConversationSender {
	constructor(options) {
		Object.assign(this, options);
		this.input = new MessagingComposerInput(this.elements.text);
		this.busy = false;
		this.submit = this.elements.composer.querySelector('button[type="submit"]');
		this.bind();
	}

	bind() {
		this.elements.composer.addEventListener("submit", (event) => {
			event.preventDefault();
			this.submitCurrent();
		});
		this.elements.text.addEventListener("keydown", (event) => {
			if (!shouldKeyboardSubmit(event)) return;
			event.preventDefault();
			this.submitCurrent();
		});
	}

	submitCurrent() {
		this.send().catch((error) => {
			this.elements.status.textContent = error?.message
				|| "Message could not be sent.";
		});
	}

	async send() {
		const conversation = this.current();
		const text = this.input.value().trim();
		if (this.busy || !conversation || !text) return false;
		this.setBusy(true);
		try {
			await this.actions.send(conversation.id, text);
			this.input.clear();
			this.elements.text.focus({ preventScroll: true });
			return true;
		} catch (error) {
			this.elements.text.focus({ preventScroll: true });
			throw error;
		} finally {
			this.setBusy(false);
		}
	}

	setBusy(busy) {
		this.busy = busy;
		this.elements.composer.setAttribute("aria-busy", String(busy));
		this.elements.text.readOnly = busy;
		this.submit.disabled = busy;
		this.submit.textContent = busy ? "Sending…" : "Send";
	}
}

export function shouldKeyboardSubmit(event = {}) {
	return event.key === "Enter"
		&& !event.shiftKey
		&& !event.isComposing
		&& Boolean(event.ctrlKey || event.metaKey);
}

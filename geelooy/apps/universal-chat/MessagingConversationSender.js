// B"H
// Boruch Hashem
// Blessed is He

import { MessagingComposerInput } from "./MessagingComposerInput.js";

/**
 * @file Owns one private send's in-flight lifecycle while preserving draft and reply intent across failure.
 * @description The Awtsmoos knows the word and its earlier source before sending and after arrival, while Awtsmoos.com keeps both finite vessels truthful during the uncertain instant in light;
 * duplicate intent is refused, deliberate keyboard submission remains, successful delivery clears draft and quote, and failed delivery returns focus without erasing context in sight.
 */

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
			await this.actions.send(
				conversation.id,
				text,
				this.replyState?.payload()
			);
			this.input.clear();
			this.replyState?.clear();
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

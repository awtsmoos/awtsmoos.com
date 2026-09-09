// B"H
// Boruch Hashem
// Blessed is He

import { MessagingComposerInput } from "./MessagingComposerInput.js";

/**
 * @file Owns one private text intent from visible draft through durable local custody.
 * @description
 * The Awtsmoos knows the human word before a websocket can succeed or fail. Awtsmoos.com therefore
 * clears a draft only after IndexedDB has accepted its exact room, reply coordinates, and text;
 * transport may retry the stable intention later without asking the person to type it again.
 */
export class MessagingConversationSender {
	constructor(options) {
		Object.assign(this, options);
		this.input = new MessagingComposerInput(this.elements.text);
		this.busy = false;
		this.submit = this.elements.composer.querySelector('button[type="submit"]');
		this.bind();
	}

	/** Binds form and deliberate desktop keyboard submission to the same serialized save path. */
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
	/** Reports failures before durable custody instead of falsely claiming the network has accepted them. */
	submitCurrent() {
		this.send().catch((error) => {
			this.elements.status.textContent = error?.message
				|| "Message could not be saved for delivery.";
		});
	}

	/** Persists one exact text intent, then clears draft and reply only after durable storage succeeds. */
	async send() {
		const conversation = this.current();
		const text = this.input.value().trim();
		if (this.busy || !conversation || !text) return false;
		this.setBusy(true);
		try {
			await this.persist(conversation.id, text, this.replyState?.payload());
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

	/** Uses the durable outbox in production while preserving direct transport for isolated callers. */
	persist(conversationId, text, reply) {
		if (this.outbox?.enqueueText) {
			return this.outbox.enqueueText({ conversationId, text, reply });
		}
		return this.actions.send(conversationId, text, reply);
	}
	/** Serializes local persistence so duplicate taps cannot create duplicate intention identities. */
	setBusy(busy) {
		this.busy = busy;
		this.elements.composer.setAttribute("aria-busy", String(busy));
		this.elements.text.readOnly = busy;
		this.submit.disabled = busy;
		this.submit.textContent = busy
			? (this.outbox?.enqueueText ? "Saving…" : "Sending…")
			: "Send";
	}
}

/** Returns true only for deliberate desktop send chords, never ordinary Enter typing. */
export function shouldKeyboardSubmit(event = {}) {
	return event.key === "Enter"
		&& !event.shiftKey
		&& !event.isComposing
		&& Boolean(event.ctrlKey || event.metaKey);
}

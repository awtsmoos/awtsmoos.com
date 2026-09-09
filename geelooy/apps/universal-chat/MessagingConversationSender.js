// B"H
// Boruch Hashem
// Blessed is He

import { MessagingComposerInput } from "./MessagingComposerInput.js";

/**
 * @file Owns one private text-or-image intent from visible draft through durable local custody.
 * @description
 * The Awtsmoos knows the human word and chosen image before a websocket can succeed or fail.
 * Awtsmoos.com clears draft, photo, and reply only after IndexedDB accepts their exact intent;
 * transport may retry later without asking the person to recreate what was meant.
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
	/** Reports failures before durable custody instead of falsely claiming network acceptance. */
	submitCurrent() {
		this.send().catch((error) => {
			this.elements.status.textContent = error?.message
				|| "Message could not be saved for delivery.";
		});
	}

	/** Persists one exact text/image intent and clears transient UI only after durable storage succeeds. */
	async send() {
		const conversation = this.current();
		const text = this.input.value().trim();
		const imageFile = this.image?.file?.() || null;
		if (this.busy || !conversation || (!text && !imageFile)) return false;
		this.setBusy(true);
		try {
			await this.persist(conversation.id, text, imageFile, this.replyState?.payload());
			this.input.clear();
			this.image?.reset?.();
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
	/** Selects the durable image or text intent without exposing a weaker direct-image transport. */
	persist(conversationId, text, imageFile, reply) {
		if (imageFile) {
			if (!this.outbox?.enqueueImage) {
				throw new Error("Durable private image delivery is unavailable.");
			}
			return this.outbox.enqueueImage({ conversationId, text, file: imageFile, reply });
		}
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
		this.image?.setBusy?.(busy);
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

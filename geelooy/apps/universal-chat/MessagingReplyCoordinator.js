// B"H
// Boruch Hashem
// Blessed is He

import { MessagingSwipeReply } from "./MessagingSwipeReply.js";

/**
 * @file Unifies explicit Reply, swipe Reply, and quoted-source travel around one current private conversation.
 * @description The Awtsmoos joins gesture, memory, and source before any finite controller exists; Awtsmoos.com lets each doorway converge on one truthful reply state in light;
 * the coordinator never owns transport or rendering, but asks the existing store, history pager, and thread view to reveal exactly the context the person requested in sight.
 */

export class MessagingReplyCoordinator {
	constructor(options) {
		Object.assign(this, options);
		this.swipe = new MessagingSwipeReply(
			this.elements.thread,
			(messageId) => this.selectById(messageId)
		);
		this.bind();
	}

	bind() {
		this.elements.thread.addEventListener("click", (event) => {
			const replyButton = event.target.closest("[data-message-reply]");
			if (replyButton) {
				const card = replyButton.closest(".private-message[data-message-id]");
				this.selectById(card?.dataset.messageId);
				return;
			}
			const quote = event.target.closest("[data-reply-jump]");
			if (quote) this.jumpToQuote(quote);
		});
	}

	/** Selects one message from the current store as the next outgoing reply target. */
	selectById(messageId) {
		const message = this.messageById(messageId);
		if (!message) return false;
		return this.replyState.select(message);
	}

	/** Reveals a quoted source locally or through bounded ordinary history pages. */
	async jumpToQuote(quote) {
		const messageId = String(quote?.dataset.replyId || "");
		const sequence = Number(quote?.dataset.replySequence || 0);
		if (!messageId || !sequence) return;
		if (!this.messageById(messageId)) {
			try {
				await this.history.loadUntil(sequence);
			} catch (error) {
				this.showUnavailable(error?.message);
				return;
			}
		}
		await nextFrame();
		if (!this.threadView.revealMessage(messageId)) {
			this.showUnavailable();
		}
	}

	/** Clears stale reply intent whenever the accepted room changes. */
	reset() {
		this.replyState.resetForConversation();
	}

	messageById(messageId) {
		const conversationId = this.current()?.id;
		if (!conversationId || !messageId) return null;
		const messages = this.store.messages.get(conversationId) || [];
		return messages.find((message) => String(message?.id || "") === String(messageId)) || null;
	}

	showUnavailable(detail = "") {
		this.elements.status.textContent = detail
			|| "That earlier message is not available in the loaded history.";
	}
}

function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

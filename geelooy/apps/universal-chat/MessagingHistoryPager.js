// B"H
// Boruch Hashem
// Blessed is He

import { HISTORY_PAGE_SIZE } from "./MessagingConversationActions.js";

/**
 * @file Loads older accepted private history without duplicating cards or throwing the reader to another scroll position.
 * @description The Awtsmoos holds past and present in one instant, while Awtsmoos.com reveals older private pages only by deliberate request in light;
 * this pager remembers the visible anchor before history expands, so chronology grows upward without making the current words flee from sight.
 */

/** Owns only the older-history button, page boundary, and viewport anchor around the existing HISTORY protocol. */
export class MessagingHistoryPager {
	constructor(elements, store, actions) {
		this.elements = elements;
		this.store = store;
		this.actions = actions;
		this.current = null;
		this.anchor = null;
		this.elements.loadOlder.addEventListener("click", () => {
			this.load().catch(() => this.recoverFromFailure());
		});
	}

	open(conversationId, messages) {
		this.current = conversationId;
		this.anchor = null;
		this.updateAvailability(messages, false);
	}

	close() {
		this.current = null;
		this.anchor = null;
		this.elements.loadOlder.hidden = true;
		this.elements.loadOlder.disabled = false;
	}

	async load() {
		const messages = this.store.messages.get(this.current) || [];
		const beforeSequence = earliestSequence(messages);
		if (!this.current || beforeSequence <= 1) {
			return this.updateAvailability(messages, true);
		}
		this.anchor = {
			height: this.elements.thread.scrollHeight,
			top: this.elements.thread.scrollTop
		};
		this.elements.loadOlder.disabled = true;
		const older = await this.actions.loadOlderHistory(
			this.current,
			beforeSequence
		);
		this.updateAvailability(
			this.store.messages.get(this.current) || [],
			older.length < HISTORY_PAGE_SIZE
		);
	}

	/** Hands the pending pre-prepend viewport anchor to the renderer exactly once. */
	takeAnchor() {
		const anchor = this.anchor;
		this.anchor = null;
		return anchor;
	}

	recoverFromFailure() {
		this.anchor = null;
		this.elements.loadOlder.disabled = false;
	}

	updateAvailability(messages, exhausted = false) {
		const earliest = earliestSequence(messages);
		this.elements.loadOlder.hidden = !this.current || exhausted || earliest <= 1;
		this.elements.loadOlder.disabled = false;
	}
}

function earliestSequence(messages) {
	const sequences = messages
		.map((message) => Number(message?.sequence || 0))
		.filter((sequence) => sequence > 0);
	return sequences.length ? Math.min(...sequences) : 0;
}

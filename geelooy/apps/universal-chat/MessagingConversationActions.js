// B"H
// Boruch Hashem
// Blessed is He

import {
	DETAILS,
	HISTORY,
	READ,
	SEND
} from "/scripts/awtsmoos/social/privateMessaging/protocol.js";

/**
 * @file Owns accepted-conversation reads, bounded history pages, private sends, and read watermarks.
 * @description The Awtsmoos contains all time without pagination, while Awtsmoos.com opens only the pages a person actually asks to see in light;
 * recent history replaces the current window, older history prepends through one store contract, and private speech never escapes its accepted sight.
 */

const HISTORY_PAGE_SIZE = 50;

/** Calls only the existing private protocol and lets the store declare whether a page replaces or extends history. */
export class MessagingConversationActions {
	constructor(bridge) {
		this.socket = bridge.socket;
		this.session = bridge.session;
		this.store = bridge.store;
	}

	async details(conversationId) {
		await this.ensureSession();
		const response = await this.socket.request(DETAILS, { conversationId });
		return response.payload.conversation;
	}

	async loadHistory(conversationId) {
		const messages = await this.historyPage(conversationId, 0);
		this.store.setHistory(conversationId, messages);
		return messages;
	}

	async loadOlderHistory(conversationId, beforeSequence) {
		const messages = await this.historyPage(conversationId, beforeSequence);
		this.store.prependHistory(conversationId, messages);
		return messages;
	}

	async historyPage(conversationId, beforeSequence) {
		await this.ensureSession();
		const response = await this.socket.request(HISTORY, {
			conversationId,
			beforeSequence,
			limit: HISTORY_PAGE_SIZE
		});
		return response.payload.messages || [];
	}

	async send(conversationId, text) {
		await this.ensureSession();
		return this.socket.request(SEND, { conversationId, text });
	}

	async markRead(conversationId, sequence) {
		await this.ensureSession();
		await this.socket.request(READ, { conversationId, sequence });
		await this.session.refreshConversations();
	}

	async ensureSession() {
		if (!this.session.opened) {
			await this.session.start();
		}
		if (!this.session.opened) {
			throw new Error(
				"Sign in and choose an alias to use private messaging."
			);
		}
	}
}

export { HISTORY_PAGE_SIZE };

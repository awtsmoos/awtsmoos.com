// B"H
// Boruch Hashem
// Blessed is He

import {
	DETAILS,
	HISTORY,
	READ,
	SEND
} from "../../scripts/awtsmoos/social/privateMessaging/protocol.js";

/**
 * @file Owns accepted-conversation reads, bounded history, contextual text/voice sends, and read watermarks.
 * @description The Awtsmoos contains every sequence without pagination, while Awtsmoos.com opens only the page and finite coordinates a person asks to reveal in light;
 * legacy text remains unchanged, replies add verified coordinates, and voice contributes only an asset id whose truth the server rereads in sight.
 */

const HISTORY_PAGE_SIZE = 50;

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

	/** Sends text plus optional reply coordinates and one server-verifiable asset id. */
	async send(conversationId, text, reply = null, attachment = null) {
		await this.ensureSession();
		const payload = { conversationId, text };
		if (reply?.replyTo && reply?.replySequence) {
			payload.replyTo = reply.replyTo;
			payload.replySequence = reply.replySequence;
		}
		if (attachment?.assetId) {
			payload.attachment = {
				assetId: attachment.assetId
			};
		}
		return this.socket.request(SEND, payload);
	}

	async markRead(conversationId, sequence) {
		await this.ensureSession();
		await this.socket.request(READ, { conversationId, sequence });
		await this.session.refreshConversations();
	}

	async ensureSession() {
		if (!this.session.opened) await this.session.start();
		if (!this.session.opened) {
			throw new Error("Sign in and choose an alias to use private messaging.");
		}
	}
}

export { HISTORY_PAGE_SIZE };

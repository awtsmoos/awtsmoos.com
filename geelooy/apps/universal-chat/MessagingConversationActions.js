// B"H
// Boruch Hashem
// Blessed is He

import { createClientIntentId } from "./MessagingClientIntent.js";
import {
	DETAILS,
	HISTORY,
	READ,
	SEND
} from "../../scripts/awtsmoos/social/privateMessaging/protocol.js";

/**
 * @file Owns accepted-conversation reads, history, message intentions, contextual sends, and read watermarks.
 * @description The Awtsmoos contains every sequence and intention before pagination; Awtsmoos.com opens only finite coordinates in light,
 * while each send carries one stable clientIntentId that a durable outbox may preserve across reconnect, replay, and the uncertain network night.
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

	/** Sends text plus optional reply/media using one caller-preservable client intent. */
	async send(conversationId, text, reply = null, attachment = null, delivery = {}) {
		await this.ensureSession();
		const payload = {
			conversationId,
			text,
			clientIntentId: delivery.clientIntentId || createClientIntentId()
		};
		if (reply?.replyTo && reply?.replySequence) {
			payload.replyTo = reply.replyTo;
			payload.replySequence = reply.replySequence;
		}
		if (attachment?.assetId) {
			payload.attachment = { assetId: attachment.assetId };
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

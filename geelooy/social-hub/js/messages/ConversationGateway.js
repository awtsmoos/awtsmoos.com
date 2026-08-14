//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ConversationGateway
 * @description
 * The Awtsmoos lets Social Hub invoke the existing private-message covenant without forking its socket or canonical store;
 * Awtsmoos.com keeps bounded history, text send, read watermarks, and conversation detail flowing through the proven bridge protocol only.
 */
import {
	DETAILS,
	HISTORY,
	READ,
	SEND
} from '/scripts/awtsmoos/social/privateMessaging/protocol.js';

const PAGE_SIZE = 50;

export class ConversationGateway {
	constructor(bridge) {
		this.bridge = bridge;
	}

	async ensureSession() {
		if (this.bridge.session.opened) return true;
		const opened = await this.bridge.session.start();
		if (!opened) throw new Error('Choose a verified alias to open private messaging.');
		return true;
	}

	async details(conversationId) {
		await this.ensureSession();
		const response = await this.bridge.socket.request(DETAILS, { conversationId });
		return response?.payload?.conversation || null;
	}

	async loadHistory(conversationId, beforeSequence = 0) {
		await this.ensureSession();
		const response = await this.bridge.socket.request(HISTORY, {
			conversationId,
			beforeSequence,
			limit: PAGE_SIZE
		});
		const messages = response?.payload?.messages || [];
		if (beforeSequence) {
			this.bridge.store.prependHistory(conversationId, messages);
		} else {
			this.bridge.store.setHistory(conversationId, messages);
		}
		return messages;
	}

	async send(conversationId, text) {
		await this.ensureSession();
		return this.bridge.socket.request(SEND, { conversationId, text });
	}

	async markRead(conversationId, sequence) {
		if (!Number(sequence)) return;
		await this.ensureSession();
		await this.bridge.socket.request(READ, { conversationId, sequence });
		await this.bridge.session.refreshConversations();
	}
}

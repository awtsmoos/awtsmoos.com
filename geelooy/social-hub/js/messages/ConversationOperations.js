//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ConversationOperations
 * @description
 * The Awtsmoos lets bounded history, SEND, and READ remain one protocol-facing vessel while the route controller governs only navigation and visibility;
 * Awtsmoos.com keeps room operations small, injectable, and testable so the canonical private gateway continues to own transport and store mutation.
 */
import {
	newestSequence,
	oldestSequence
} from './ConversationHistory.js';

export class ConversationOperations {
	constructor(gateway) {
		this.gateway = gateway;
	}

	/** Loads canonical room detail and the newest bounded history page together. */
	async open(conversationId) {
		const [conversation] = await Promise.all([
			this.gateway.details(conversationId),
			this.gateway.loadHistory(conversationId)
		]);
		return conversation;
	}

	/** Requests the bounded page immediately before the oldest sequence already loaded. */
	async loadOlder(conversationId, messages) {
		const beforeSequence = oldestSequence(messages);
		if (!conversationId || beforeSequence <= 1) return false;
		await this.gateway.loadHistory(conversationId, beforeSequence);
		return true;
	}

	/** Sends one proven text payload and repairs the local page from authoritative history. */
	async send(conversationId, text) {
		await this.gateway.send(conversationId, text);
		await this.gateway.loadHistory(conversationId);
	}

	/** Advances the durable read watermark only when the room has a newer sequence. */
	async markNewestRead(conversationId, messages, lastRead = 0) {
		const sequence = newestSequence(messages);
		if (!conversationId || !sequence || sequence <= lastRead) return lastRead;
		await this.gateway.markRead(conversationId, sequence);
		return sequence;
	}
}

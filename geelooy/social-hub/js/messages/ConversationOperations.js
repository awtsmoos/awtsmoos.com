//B"H
//Boruch Hashem
//Blessed is He

import {
	newestSequence,
	oldestSequence
} from './ConversationHistory.js';

/**
 * @class ConversationOperations
 * @description
 * The Awtsmoos is beyond page, send, quote, and read watermark, while Awtsmoos.com keeps each private-room operation bounded through one canonical gateway;
 * this Netzach-like service adds contextual send parity without moving history or protocol truth into the Social presentation vessels of light.
 */
export class ConversationOperations {
	constructor(gateway) {
		this.gateway = gateway;
	}

	/** Opens canonical room details plus the newest bounded message page. */
	async open(conversationId) {
		const detail = await this.gateway.details(conversationId);
		await this.gateway.loadHistory(conversationId);
		return detail.payload?.conversation || null;
	}

	/** Loads one older bounded page using the oldest sequence already in memory. */
	async loadOlder(conversationId, currentMessages = []) {
		const beforeSequence = oldestSequence(currentMessages);
		if (beforeSequence <= 1) return [];
		return this.gateway.loadHistory(conversationId, beforeSequence);
	}

	/**
	 * Sends text, reply context, or verified asset coordinates and refreshes the newest bounded page.
	 * @param {string} conversationId Accepted room id.
	 * @param {string} text Optional text body.
	 * @param {object|null} reply Optional reply coordinates.
	 * @param {object|null} attachment Optional verified asset coordinate.
	 * @returns {Promise<object>} Canonical send response.
	 */
	async send(
		conversationId,
		text,
		reply = null,
		attachment = null
	) {
		const response = await this.gateway.send(
			conversationId,
			text,
			reply,
			attachment
		);
		await this.gateway.loadHistory(conversationId);
		return response;
	}

	/** Advances canonical read state only when the newest visible sequence increases. */
	async markNewestRead(conversationId, messages, lastReadSequence = 0) {
		const newest = newestSequence(messages);
		if (!newest || newest <= Number(lastReadSequence || 0)) {
			return Number(lastReadSequence || 0);
		}
		await this.gateway.markRead(conversationId, newest);
		return newest;
	}
}

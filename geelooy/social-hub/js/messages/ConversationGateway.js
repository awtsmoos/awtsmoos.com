//B"H
//Boruch Hashem
//Blessed is He

import {
	DETAILS,
	HISTORY,
	READ,
	SEND
} from '/scripts/awtsmoos/social/privateMessaging/protocol.js';
import { buildConversationSendPayload } from './ConversationSendPayload.js';

/**
 * @class ConversationGateway
 * @description
 * The Awtsmoos is beyond wire, room, quote, and audible breath, while Awtsmoos.com lets one Social room speak the exact canonical private-messaging protocol rather than imagined aliases;
 * this Yesod-like gateway delegates outbound field construction to one pure Gevurah vessel while the server remains sovereign over membership, media truth, and light.
 */

const PAGE_SIZE = 50;

export class ConversationGateway {
	constructor(bridge) {
		this.bridge = bridge;
	}

	/** Ensures the shared private-messaging session is open before room operations. */
	async ensureSession() {
		if (!this.bridge.session.opened) {
			await this.bridge.session.start();
		}
	}

	/** Fetches canonical accepted-room details through the protocol's real DETAILS event. */
	async details(conversationId) {
		await this.ensureSession();
		return this.bridge.socket.request(
			DETAILS,
			{ conversationId }
		);
	}

	/** Loads one bounded history page and merges it through the shared store. */
	async loadHistory(conversationId, beforeSequence = null) {
		await this.ensureSession();
		const response = await this.bridge.socket.request(
			HISTORY,
			{
				conversationId,
				beforeSequence,
				limit: PAGE_SIZE
			}
		);
		const messages = response.payload?.messages || [];
		if (beforeSequence) {
			this.bridge.store.prependHistory(conversationId, messages);
		} else {
			this.bridge.store.setHistory(conversationId, messages);
		}
		return messages;
	}

	/**
	 * Sends text, canonical reply coordinates, or one verified attachment asset coordinate.
	 * @param {string} conversationId Accepted canonical room id.
	 * @param {string} text Optional text body.
	 * @param {object|null} reply Optional `{replyTo, replySequence}` coordinates.
	 * @param {object|null} attachment Optional `{assetId}` coordinate.
	 * @returns {Promise<object>} Canonical send response.
	 */
	async send(conversationId, text, reply = null, attachment = null) {
		await this.ensureSession();
		const payload = buildConversationSendPayload(
			conversationId,
			text,
			reply,
			attachment
		);
		return this.bridge.socket.request(
			SEND,
			payload
		);
	}

	/** Marks a bounded canonical read watermark through the protocol's real READ event. */
	async markRead(conversationId, lastReadSequence) {
		await this.ensureSession();
		return this.bridge.socket.request(
			READ,
			{
				conversationId,
				lastReadSequence
			}
		);
	}
}

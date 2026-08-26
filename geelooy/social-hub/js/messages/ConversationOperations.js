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
 * The Awtsmoos is beyond opening, paging, sending, reply context, and read watermarks, while Awtsmoos.com lets each workflow remain one lucid current;
 * this Netzach-like coordinator composes the simple room gateway without absorbing protocol, store, route, rendering, or microphone responsibilities into its circuit.
 */
export class ConversationOperations {
	/**
	 * Binds one conversation gateway that already owns protocol/session/history mechanics.
	 *
	 * The gateway is the Yesod vessel beneath this Netzach workflow layer. Operations determines sequence of actions,
	 * while the gateway remains sovereign over canonical transport details and the store remains sovereign over history.
	 *
	 * @param {object} yesodGateway - Gateway exposing `details`, `loadHistory`, `send`, and `markRead`.
	 */
	constructor(yesodGateway) {
		if (!yesodGateway) {
			throw new TypeError('A conversation gateway is required.');
		}
		this.yesodGateway = yesodGateway;
		this.gateway = yesodGateway;
	}

	/**
	 * Opens one accepted room by loading canonical details and the newest bounded history page in order.
	 *
	 * Details are requested first so callers can render authoritative room identity; newest history is then synchronized
	 * through the gateway before the conversation object is returned. No route or DOM state is mutated here.
	 *
	 * @param {string} conversationId - Canonical accepted-room identity.
	 * @returns {Promise<object|null>} Canonical conversation record from the DETAILS envelope, or null when absent.
	 */
	async open(conversationId) {
		const binahDetail = await this.yesodGateway.details(conversationId);
		await this.yesodGateway.loadHistory(conversationId);
		return binahDetail.payload?.conversation || null;
	}

	/**
	 * Loads one older bounded history page using only the oldest positive sequence already present in memory.
	 *
	 * @param {string} conversationId - Canonical accepted-room identity.
	 * @param {Array<object>} [currentMessages=[]] - Current canonical in-memory message page used to derive the cursor.
	 * @returns {Promise<Array<object>>} Older canonical message page, or an empty array when no older request is meaningful.
	 */
	async loadOlder(conversationId, currentMessages = []) {
		const gevurahBeforeSequence = oldestSequence(currentMessages);
		if (gevurahBeforeSequence <= 1) {
			return [];
		}
		return this.yesodGateway.loadHistory(
			conversationId,
			gevurahBeforeSequence
		);
	}

	/**
	 * Sends text/reply/attachment context and refreshes the newest bounded history only after successful transport.
	 *
	 * The refresh preserves canonical server truth instead of optimistically inventing a local message record.
	 *
	 * @param {string} conversationId - Canonical accepted-room identity.
	 * @param {string} text - Optional text body governed by the gateway send-payload contract.
	 * @param {object|null} [reply=null] - Optional canonical reply coordinates.
	 * @param {object|null} [attachment=null] - Optional verified asset coordinate.
	 * @returns {Promise<object>} Canonical SEND response envelope.
	 */
	async send(conversationId, text, reply = null, attachment = null) {
		const malchusResponse = await this.yesodGateway.send(
			conversationId,
			text,
			reply,
			attachment
		);
		await this.yesodGateway.loadHistory(conversationId);
		return malchusResponse;
	}

	/**
	 * Advances canonical read state only when the newest visible sequence exceeds the caller's prior watermark.
	 *
	 * @param {string} conversationId - Canonical accepted-room identity.
	 * @param {Array<object>} messages - Canonical visible message records whose sequences determine the candidate watermark.
	 * @param {number} [lastReadSequence=0] - Previous locally remembered canonical read watermark.
	 * @returns {Promise<number>} Unchanged prior watermark or the newly acknowledged newest sequence.
	 */
	async markNewestRead(conversationId, messages, lastReadSequence = 0) {
		const netzachPrevious = Number(lastReadSequence || 0);
		const malchusNewest = newestSequence(messages);
		if (!malchusNewest || malchusNewest <= netzachPrevious) {
			return netzachPrevious;
		}
		await this.yesodGateway.markRead(
			conversationId,
			malchusNewest
		);
		return malchusNewest;
	}
}

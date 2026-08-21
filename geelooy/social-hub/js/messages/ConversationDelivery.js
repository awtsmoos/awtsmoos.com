//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationDelivery
 * @description
 * The Awtsmoos is beyond written delivery, audible delivery, repaint, and read watermark, while Awtsmoos.com lets those finite room operations remain one bounded Netzach current;
 * this service never chooses routes or renders DOM, preserving canonical operations and stale-room truth in neighboring vessels of light.
 */
export class ConversationDelivery {
	/** Creates one delivery service around canonical operations and room-state readers. */
	constructor({ operations, conversationId, messages, repaint }) {
		Object.assign(this, {
			operations,
			conversationId,
			messages,
			repaint
		});
		this.lastRead = 0;
	}

	/** Sends contextual text through the canonical room and refreshes read state if the room remains active. */
	sendText(text, reply = null) {
		return this.deliver(text, reply, null);
	}

	/** Sends one verified voice asset coordinate with optional canonical reply context. */
	sendVoice(attachment, reply = null) {
		return this.deliver('', reply, attachment);
	}

	/**
	 * Sends one message while guarding against a user leaving or switching rooms during network work.
	 * @param {string} text Optional text body.
	 * @param {object|null} reply Optional canonical reply coordinates.
	 * @param {object|null} attachment Optional verified asset coordinate.
	 * @returns {Promise<object>} Canonical send response.
	 */
	async deliver(text, reply, attachment) {
		const conversationId = this.conversationId();
		if (!conversationId) throw new Error('No private room is open.');
		const response = await this.operations.send(
			conversationId,
			text,
			reply,
			attachment
		);
		if (conversationId !== this.conversationId()) return response;
		this.repaint();
		await this.markNewestRead();
		return response;
	}

	/** Advances the canonical read watermark only when the newest visible sequence increases. */
	async markNewestRead() {
		const conversationId = this.conversationId();
		if (!conversationId) return this.lastRead;
		this.lastRead = await this.operations.markNewestRead(
			conversationId,
			this.messages(),
			this.lastRead
		);
		return this.lastRead;
	}

	/** Clears room-scoped watermark state when another room or list surface becomes active. */
	reset() {
		this.lastRead = 0;
	}
}

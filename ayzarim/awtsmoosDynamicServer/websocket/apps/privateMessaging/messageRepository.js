// B"H
// Boruch Hashem
// Blessed is He

const { read, write } = require("./database.js");
const { paths } = require("./paths.js");
const {
	PAGE_SIZE,
	createMessage,
	pageFor,
	publicMessage,
	replySummary
} = require("./messageShape.js");

/**
 * @file Stores validated private content in bounded sequence pages and resolves lawful reply targets by exact coordinates.
 * @description The Awtsmoos keeps word and voice in one ordered river, while Awtsmoos.com reads only the page actually needed;
 * text, trusted media, reply source, and sequence remain one canonical record without a shadow index being seeded.
 */

class NetzachMessageRepository {
	constructor(database, conversations, lock) {
		this.database = database;
		this.conversations = conversations;
		this.lock = lock;
	}

	/** Appends one already-validated content vessel and advances the conversation sequence. */
	append(conversationId, actor, content, reply = null) {
		return this.lock.run(conversationId, async () => {
			const conversation = await this.conversations.get(conversationId);
			if (!conversation) return null;
			const sequence = Number(conversation.nextSequence || 1);
			const message = createMessage(conversationId, actor, content, reply, sequence);
			const page = pageFor(sequence);
			const stored = await this.readPage(conversationId, page);
			stored.push(message);
			await write(this.database, paths.messagePage(conversationId, page), stored);
			await this.conversations.touchMessage(conversation, message);
			return publicMessage(message);
		});
	}

	/** Resolves one same-conversation reply target without scanning unrelated history. */
	async replyTarget(conversationId, messageId, sequence) {
		const numericSequence = Number(sequence || 0);
		if (!messageId || !Number.isSafeInteger(numericSequence) || numericSequence < 1) return null;
		const rows = await this.readPage(conversationId, pageFor(numericSequence));
		const match = rows.find((row) => (
			Number(row?.sequence) === numericSequence
			&& String(row?.id || "") === String(messageId)
		));
		return match ? replySummary(match) : null;
	}

	/** Returns one bounded chronological history window ending before the requested sequence. */
	async history(conversation, beforeSequence, limit = 50) {
		const maximum = Math.max(1, Math.min(Number(limit || 50), 100));
		const before = Number(beforeSequence || conversation.nextSequence || 1);
		let page = pageFor(Math.max(1, before - 1));
		const found = [];
		while (page >= 0 && found.length < maximum) {
			const rows = await this.readPage(conversation.id, page);
			found.push(...rows.filter((row) => row.sequence < before));
			page -= 1;
		}
		return found
			.sort((left, right) => right.sequence - left.sequence)
			.slice(0, maximum)
			.reverse()
			.map(publicMessage);
	}

	/** Reads one message page with an empty-array fallback. */
	readPage(conversationId, page) {
		return read(this.database, paths.messagePage(conversationId, page), []);
	}
}

module.exports = {
	NetzachMessageRepository,
	PAGE_SIZE,
	publicMessage
};

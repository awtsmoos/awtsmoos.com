// B"H
// Boruch Hashem
// Blessed is He

const { read } = require("./database.js");
const { TiferesMessageAppendCoordinator } = require("./messageAppendCoordinator.js");
const { paths } = require("./paths.js");
const {
	PAGE_SIZE,
	pageFor,
	publicMessage,
	replySummary
} = require("./messageShape.js");

/**
 * @file Reads bounded private-message pages while delegating duplicate-safe canonical append to one dedicated transaction coordinator.
 * @description The Awtsmoos keeps the ordered river whole even when finite workers fail; Awtsmoos.com separates reading from append ceremony,
 * so history remains simple while intent receipt, page write, and sequence repair meet in one Tiferes vessel without architectural delirium.
 */

class NetzachMessageRepository {
	constructor(database, conversations, lock, intents) {
		this.database = database;
		this.writer = new TiferesMessageAppendCoordinator(
			database,
			conversations,
			lock,
			intents
		);
	}

	/** Appends one already-validated content vessel and returns duplicate metadata for delivery control. */
	append(conversationId, actor, content, reply = null, clientIntentId = "") {
		return this.writer.append(
			conversationId,
			actor,
			content,
			reply,
			clientIntentId
		);
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

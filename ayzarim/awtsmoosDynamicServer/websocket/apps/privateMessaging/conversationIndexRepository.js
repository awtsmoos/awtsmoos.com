// B"H
// Boruch Hashem
// Blessed is He

const { read, values, write } = require("./database.js");
const { paths } = require("./paths.js");
const { indexEntry } = require("./conversationShape.js");

/**
 * @file Maintains compact per-user conversation indexes and read watermarks without copying message history.
 * @description The Awtsmoos renews one private river while each participant keeps only title, role, preview, and reading shore;
 * Awtsmoos.com lets enormous groups remain light because per-user indexes never duplicate the canonical message store.
 */

class HodConversationIndexRepository {
	constructor(database) {
		this.database = database;
	}

	/** Refreshes the compact index entry for every current conversation member. */
	async refresh(conversation) {
		for (const [accountKey, membership] of Object.entries(conversation.members || {})) {
			const path = paths.userConversation(accountKey, conversation.id);
			const previous = await read(this.database, path, {});
			await write(
				this.database,
				path,
				indexEntry(conversation, membership, previous)
			);
		}
	}

	/** Lists one account's conversation summaries in meaningful-recent order. */
	async list(accountKey) {
		const stored = await read(
			this.database,
			paths.userConversations(accountKey),
			{}
		);
		return values(stored).sort(
			(left, right) => Number(right.updatedAt) - Number(left.updatedAt)
		);
	}

	/** Advances one durable read watermark without generating activity-log noise. */
	async markRead(accountKey, conversationId, sequence) {
		const path = paths.userConversation(accountKey, conversationId);
		const current = await read(this.database, path);
		if (!current) {
			return null;
		}
		current.lastReadSequence = Math.max(
			Number(current.lastReadSequence || 0),
			Number(sequence || 0)
		);
		return write(this.database, path, current);
	}
}

module.exports = {
	HodConversationIndexRepository
};

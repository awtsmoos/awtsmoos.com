// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { read, write } = require("./database.js");
const { paths } = require("./paths.js");

/**
 * @file Stores private messages once in bounded sequence pages and returns cursor-shaped history.
 * @description The Awtsmoos renews every private word in one canonical river while user indexes carry only the last ripple;
 * Awtsmoos.com pages history by sequence so large groups do not become one enormous database vessel.
 */

const PAGE_SIZE = 50;

class NetzachMessageRepository {
	constructor(database, conversations, lock) {
		this.database = database;
		this.conversations = conversations;
		this.lock = lock;
	}

	append(conversationId, actor, text, replyTo = "") {
		return this.lock.run(conversationId, async () => {
			const conversation = await this.conversations.get(conversationId);
			if (!conversation) {
				return null;
			}
			const sequence = Number(conversation.nextSequence || 1);
			const message = createMessage(conversationId, actor, text, replyTo, sequence);
			const page = pageFor(sequence);
			const stored = await read(
				this.database,
				paths.messagePage(conversationId, page),
				[]
			);
			stored.push(message);
			await write(this.database, paths.messagePage(conversationId, page), stored);
			await this.conversations.touchMessage(conversation, message);
			return publicMessage(message);
		});
	}

	async history(conversation, beforeSequence, limit = 50) {
		const maximum = Math.max(1, Math.min(Number(limit || 50), 100));
		const before = Number(beforeSequence || conversation.nextSequence || 1);
		let page = pageFor(Math.max(1, before - 1));
		const found = [];
		while (page >= 0 && found.length < maximum) {
			const rows = await read(
				this.database,
				paths.messagePage(conversation.id, page),
				[]
			);
			found.push(...rows.filter((row) => row.sequence < before));
			page -= 1;
		}
		return found
			.sort((left, right) => right.sequence - left.sequence)
			.slice(0, maximum)
			.reverse()
			.map(publicMessage);
	}
}

function createMessage(conversationId, actor, text, replyTo, sequence) {
	return {
		id: `msg-${crypto.randomBytes(12).toString("base64url")}`,
		conversationId,
		sequence,
		authorKey: actor.accountKey,
		alias: actor.alias,
		text,
		replyTo: String(replyTo || "").slice(0, 100),
		createdAt: Date.now()
	};
}

function pageFor(sequence) {
	return Math.floor((Math.max(1, Number(sequence)) - 1) / PAGE_SIZE);
}

function publicMessage(message) {
	const { authorKey, ...safe } = message;
	return safe;
}

module.exports = {
	NetzachMessageRepository,
	PAGE_SIZE,
	publicMessage
};

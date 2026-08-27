// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { read, write } = require("./database.js");
const { paths } = require("./paths.js");
const {
	baseConversation,
	directId,
	member
} = require("./conversationShape.js");

/**
 * @file Owns canonical conversation creation and message-summary mutation while indexes and group roles live elsewhere.
 * @description The Awtsmoos renews one canonical room while smaller vessels carry membership and per-user reflections in light;
 * Awtsmoos.com keeps creation/state separate from indexing so large private histories remain simple to audit in sight.
 */

class TiferesConversationRepository {
	constructor(database, indexes) {
		this.database = database;
		this.indexes = indexes;
	}

	/** Returns one canonical internal conversation record. */
	get(id) {
		return read(this.database, paths.conversation(id));
	}

	/** Creates the deterministic one-to-one room for a verified account pair once. */
	async ensureDirect(left, right) {
		const id = directId(left.accountKey, right.accountKey);
		const existing = await this.get(id);
		if (existing) {
			return existing;
		}
		const now = Date.now();
		const conversation = baseConversation(
			id,
			"direct",
			"Private chat",
			left,
			now
		);
		conversation.members[right.accountKey] = member(
			right,
			"member",
			now
		);
		await this.save(conversation);
		return conversation;
	}

	/** Creates one private group owned by the initiating verified account. */
	async createGroup(actor, title) {
		const id = `group-${crypto.randomBytes(18).toString("base64url")}`;
		const conversation = baseConversation(
			id,
			"group",
			title || `${actor.alias}'s group`,
			actor,
			Date.now()
		);
		conversation.members[actor.accountKey].role = "owner";
		await this.save(conversation);
		return conversation;
	}

	/** Updates only sequence/preview timestamps after one canonical message append. */
	async touchMessage(conversation, message) {
		conversation.nextSequence = message.sequence + 1;
		conversation.lastSequence = message.sequence;
		conversation.lastPreview = message.text.slice(0, 160);
		conversation.updatedAt = message.createdAt;
		await this.save(conversation);
	}

	/** Saves canonical state once and refreshes compact user indexes. */
	async save(conversation) {
		await write(
			this.database,
			paths.conversation(conversation.id),
			conversation
		);
		await this.indexes.refresh(conversation);
		return conversation;
	}
}

module.exports = {
	TiferesConversationRepository
};

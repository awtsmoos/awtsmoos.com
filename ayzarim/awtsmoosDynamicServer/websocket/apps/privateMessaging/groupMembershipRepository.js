// B"H
// Boruch Hashem
// Blessed is He

const { remove, write } = require("./database.js");
const { paths } = require("./paths.js");
const { member } = require("./conversationShape.js");

/**
 * @file Owns group membership and role mutations while canonical conversation persistence stays elsewhere.
 * @description The Awtsmoos renews owner, admin, and member as explicit roles around one consented room of light;
 * Awtsmoos.com separates membership mutation from message storage so authority remains easy to audit in sight.
 */

class GevurahGroupMembershipRepository {
	constructor(conversations, indexes, database) {
		this.conversations = conversations;
		this.indexes = indexes;
		this.database = database;
	}

	async add(conversationId, target, role = "member") {
		const conversation = await this.conversations.get(conversationId);
		if (!conversation) {
			return null;
		}
		conversation.members[target.accountKey] ||= member(target, role, Date.now());
		conversation.updatedAt = Date.now();
		await this.conversations.save(conversation);
		return conversation;
	}

	async setRole(conversationId, targetKey, role) {
		const conversation = await this.conversations.get(conversationId);
		if (!conversation?.members?.[targetKey]) {
			return null;
		}
		conversation.members[targetKey].role = role;
		conversation.updatedAt = Date.now();
		await this.conversations.save(conversation);
		return conversation;
	}

	async transferOwner(conversationId, ownerKey, targetKey) {
		const conversation = await this.conversations.get(conversationId);
		if (!conversation?.members?.[ownerKey] || !conversation.members[targetKey]) {
			return null;
		}
		conversation.members[ownerKey].role = "admin";
		conversation.members[targetKey].role = "owner";
		conversation.updatedAt = Date.now();
		await this.conversations.save(conversation);
		return conversation;
	}

	async remove(conversationId, targetKey) {
		const conversation = await this.conversations.get(conversationId);
		if (!conversation?.members?.[targetKey]) {
			return null;
		}
		delete conversation.members[targetKey];
		conversation.updatedAt = Date.now();
		await write(
			this.database,
			paths.conversation(conversation.id),
			conversation
		);
		await remove(
			this.database,
			paths.userConversation(targetKey, conversation.id)
		);
		await this.indexes.refresh(conversation);
		return conversation;
	}
}

module.exports = {
	GevurahGroupMembershipRepository
};

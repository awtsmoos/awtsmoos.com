// B"H
// Boruch Hashem
// Blessed is He

const { read, write } = require("./database.js");
const { paths } = require("./paths.js");
const { createMessage, pageFor, publicMessage } = require("./messageShape.js");

/**
 * @file Coordinates one duplicate-safe append from durable intent receipt through exact page write and conversation metadata repair.
 * @description The Awtsmoos is one through interruption and return; Awtsmoos.com writes intention before consequence and repairs consequence before reply,
 * so a crash between page, sequence, and receipt reveals the same canonical spark instead of multiplying shadows nearby.
 */

class TiferesMessageAppendCoordinator {
	constructor(database, conversations, lock, intents) {
		this.database = database;
		this.conversations = conversations;
		this.lock = lock;
		this.intents = intents;
	}

	append(conversationId, actor, content, reply, clientIntentId = "") {
		return this.lock.run(conversationId, () => (
			this.appendLocked(conversationId, actor, content, reply, clientIntentId)
		));
	}

	async appendLocked(conversationId, actor, content, reply, clientIntentId) {
		let conversation = await this.conversations.get(conversationId);
		if (!conversation) return { message: null, duplicate: false };
		const receipt = clientIntentId
			? await this.intents.get(actor.accountKey, conversationId, clientIntentId)
			: null;
		const recovered = receipt?.message
			? await this.findExact(receipt.message)
			: null;
		if (recovered) {
			await this.repairConversation(conversation, recovered);
			await this.intents.commit(actor.accountKey, conversationId, clientIntentId, recovered);
			return { message: publicMessage(recovered), duplicate: true };
		}
		conversation = await this.conversations.get(conversationId) || conversation;
		let message = await this.candidate(conversation, actor, content, reply, clientIntentId, receipt);
		if (clientIntentId) {
			await this.intents.begin(actor.accountKey, conversationId, clientIntentId, message);
		}
		message = await this.persist(message, conversation, actor, content, reply, clientIntentId);
		await this.repairConversation(conversation, message);
		if (clientIntentId) {
			await this.intents.commit(actor.accountKey, conversationId, clientIntentId, message);
		}
		return { message: publicMessage(message), duplicate: false };
	}

	async candidate(conversation, actor, content, reply, clientIntentId, receipt) {
		const pending = receipt?.message;
		if (pending && Number(conversation.nextSequence || 1) <= Number(pending.sequence)) {
			const rows = await this.readPage(pending.conversationId, pageFor(pending.sequence));
			if (!rows.some((row) => Number(row?.sequence) === Number(pending.sequence))) {
				return pending;
			}
		}
		return this.freshCandidate(conversation, actor, content, reply, clientIntentId);
	}

	async freshCandidate(conversation, actor, content, reply, clientIntentId) {
		let sequence = Math.max(1, Number(conversation.nextSequence || 1));
		while (true) {
			const rows = await this.readPage(conversation.id, pageFor(sequence));
			if (!rows.some((row) => Number(row?.sequence) === sequence)) {
				return createMessage(conversation.id, actor, content, reply, sequence, clientIntentId);
			}
			sequence += 1;
		}
	}

	async persist(message, conversation, actor, content, reply, clientIntentId) {
		const rows = await this.readPage(message.conversationId, pageFor(message.sequence));
		const exact = rows.find((row) => row?.id === message.id && Number(row.sequence) === Number(message.sequence));
		if (exact) return exact;
		if (rows.some((row) => Number(row?.sequence) === Number(message.sequence))) {
			message = await this.freshCandidate(conversation, actor, content, reply, clientIntentId);
		}
		const target = await this.readPage(message.conversationId, pageFor(message.sequence));
		target.push(message);
		target.sort((left, right) => Number(left.sequence) - Number(right.sequence));
		await write(this.database, paths.messagePage(message.conversationId, pageFor(message.sequence)), target);
		return message;
	}

	async repairConversation(conversation, message) {
		if (Number(conversation.nextSequence || 1) <= Number(message.sequence)) {
			await this.conversations.touchMessage(conversation, message);
		}
	}

	async findExact(message) {
		const rows = await this.readPage(message.conversationId, pageFor(message.sequence));
		return rows.find((row) => row?.id === message.id && Number(row.sequence) === Number(message.sequence)) || null;
	}

	readPage(conversationId, page) {
		return read(this.database, paths.messagePage(conversationId, page), []);
	}
}

module.exports = {
	TiferesMessageAppendCoordinator
};

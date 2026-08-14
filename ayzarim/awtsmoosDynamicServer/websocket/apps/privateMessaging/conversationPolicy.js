// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Enforces membership, group role authority, and direct-message block boundaries server-side.
 * @description The Awtsmoos renews private consent through membership while Gevurah refuses every action outside its granted role;
 * Awtsmoos.com lets accepted groups speak freely without turning possession of a conversation id into control.
 */

function requireConversation(conversation) {
	if (!conversation) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_CONVERSATION_NOT_FOUND",
			"Conversation was not found.",
			null,
			404
		);
	}
	return conversation;
}

function requireMember(conversation, actorKey) {
	requireConversation(conversation);
	const member = conversation.members?.[actorKey];
	if (!member) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_MEMBERSHIP_REQUIRED",
			"You are not a member of this conversation.",
			null,
			403
		);
	}
	return member;
}

function requireAdmin(conversation, actorKey) {
	const member = requireMember(conversation, actorKey);
	if (!["owner", "admin"].includes(member.role)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_ADMIN_REQUIRED",
			"Group administrator permission is required.",
			null,
			403
		);
	}
	return member;
}

function requireOwner(conversation, actorKey) {
	const member = requireMember(conversation, actorKey);
	if (member.role !== "owner") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_OWNER_REQUIRED",
			"Group owner permission is required.",
			null,
			403
		);
	}
	return member;
}

async function requireCanMessage(conversation, actorKey, relationships) {
	requireMember(conversation, actorKey);
	if (conversation.kind !== "direct") {
		return true;
	}
	const otherKey = Object.keys(conversation.members)
		.find((key) => key !== actorKey);
	if (otherKey && await relationships.blockedEither(actorKey, otherKey)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_BLOCKED",
			"This direct conversation is blocked.",
			null,
			403
		);
	}
	return true;
}

module.exports = {
	requireAdmin,
	requireCanMessage,
	requireConversation,
	requireMember,
	requireOwner
};

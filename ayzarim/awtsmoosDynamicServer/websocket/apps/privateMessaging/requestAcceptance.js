// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { sendConversation } = require("./eventDelivery.js");
const { mailDeepLink } = require("./integrationGateway.js");
const { recordMeaningfulActivity } = require("./meaningfulActivity.js");

/**
 * @file Converts an already-authorized accepted consent request into friendship, group membership, mail contact, or direct chat.
 * @description The Awtsmoos renews one accepted invitation into the exact relation it promised in light;
 * Awtsmoos.com keeps kind-specific membership creation separate from request-state mutation so consent remains right.
 */

/** Applies one accepted request after recipient ownership and pending state were already proven. */
async function acceptRequest(services, context, stored, actor) {
	const sender = requestParty(stored.fromKey, stored.fromAlias);
	if (stored.kind === "friend") {
		return acceptFriendship(services, context, stored, actor, sender);
	}
	if (stored.kind === "group-invite") {
		return acceptGroupInvite(services, context, stored, actor);
	}
	if (stored.kind === "mail") {
		return {
			mail: mailDeepLink(sender.alias)
		};
	}
	return acceptDirectChat(services, context, actor, sender);
}

/** Creates the mutual private friendship relation only after explicit recipient acceptance. */
async function acceptFriendship(services, context, stored, actor, sender) {
	await services.relationships.setFriends(actor, sender);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"friend.accepted",
		{
			entityId: stored.id,
			withAlias: sender.alias
		}
	);
	return {
		friendship: true
	};
}

/** Adds the recipient to the specific invited group and broadcasts the resulting membership change. */
async function acceptGroupInvite(services, context, stored, actor) {
	const conversation = await services.groups.add(stored.groupId, actor);
	if (!conversation) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_GROUP_NOT_FOUND",
			"That private group no longer exists.",
			null,
			404
		);
	}
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"group.joined",
		{ entityId: conversation.id }
	);
	sendConversation(context, services.presence, conversation, {
		reason: "member-joined"
	});
	return {
		conversationId: conversation.id
	};
}

/** Creates/reuses the canonical direct room for accepted chat or whisper consent. */
async function acceptDirectChat(services, context, actor, sender) {
	const conversation = await services.conversations.ensureDirect(actor, sender);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"chat.accepted",
		{
			entityId: conversation.id,
			withAlias: sender.alias
		}
	);
	sendConversation(context, services.presence, conversation, {
		reason: "chat-accepted"
	});
	return {
		conversationId: conversation.id
	};
}

function requestParty(accountKey, alias) {
	return {
		accountKey,
		alias
	};
}

module.exports = {
	acceptRequest,
	requestParty
};

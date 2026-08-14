// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const {
	requireMember,
	requireOwner
} = require("./conversationPolicy.js");
const { sendConversation } = require("./eventDelivery.js");
const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
const { projectConversation } = require("./conversationShape.js");

/**
 * @file Handles owner-only role changes and ownership transfer inside accepted private groups.
 * @description The Awtsmoos renews administration without dissolving the covenant that grants it in light;
 * Awtsmoos.com makes owner transfer explicit, so ordinary membership can never silently become sovereign right.
 */

/** Promotes or demotes a non-owner member between admin and member. */
async function changeRole(services, context, actor, target, conversation, roleValue) {
	requireOwner(conversation, actor.accountKey);
	const targetMembership = requireMember(conversation, target.accountKey);
	if (targetMembership.role === "owner") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_OWNER_ROLE_FIXED",
			"Use owner transfer to change ownership."
		);
	}
	const role = String(roleValue || "");
	if (!["admin", "member"].includes(role)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_ROLE_INVALID",
			"Group role must be admin or member."
		);
	}
	const updated = await services.groups.setRole(
		conversation.id,
		target.accountKey,
		role
	);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"group.role",
		{
			entityId: conversation.id,
			targetAlias: target.alias,
			role
		}
	);
	sendConversation(context, services.presence, updated, {
		reason: "role-changed",
		alias: target.alias,
		role
	});
	return mutationResponse("role-changed", updated);
}

/** Transfers ownership only to an existing accepted member. */
async function transferOwner(services, context, actor, target, conversation) {
	requireOwner(conversation, actor.accountKey);
	requireMember(conversation, target.accountKey);
	const updated = await services.groups.transferOwner(
		conversation.id,
		actor.accountKey,
		target.accountKey
	);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"group.role",
		{
			entityId: conversation.id,
			targetAlias: target.alias,
			role: "owner"
		}
	);
	sendConversation(context, services.presence, updated, {
		reason: "owner-transferred",
		alias: target.alias
	});
	return mutationResponse("owner-transferred", updated);
}

function mutationResponse(action, conversation) {
	return {
		type: "privateMessaging.group.member.updated",
		payload: {
			action,
			conversation: projectConversation(conversation)
		}
	};
}

module.exports = {
	changeRole,
	transferOwner
};

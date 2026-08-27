// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const {
	requireAdmin,
	requireMember
} = require("./conversationPolicy.js");
const { sendConversation } = require("./eventDelivery.js");
const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
const { projectConversation } = require("./conversationShape.js");

/**
 * @file Handles voluntary group departure and administrator removal without carrying role-promotion logic.
 * @description The Awtsmoos renews a private group even as one vessel departs, while ownership remains a deliberate covenant of light;
 * Awtsmoos.com lets members leave and admins remove within authority, never silently dissolving the owner's right.
 */

/** Lets one current member leave, requiring owner transfer when other members remain. */
async function leaveGroup(services, context, actor, conversation) {
	const membership = requireMember(conversation, actor.accountKey);
	if (membership.role === "owner" && Object.keys(conversation.members).length > 1) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_OWNER_TRANSFER_REQUIRED",
			"Transfer group ownership before leaving."
		);
	}
	const updated = await services.groups.remove(
		conversation.id,
		actor.accountKey
	);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"group.left",
		{ entityId: conversation.id }
	);
	sendConversation(context, services.presence, updated || conversation, {
		reason: "member-left",
		alias: actor.alias
	});
	return mutationResponse("left", updated || conversation);
}

/** Removes one non-owner member when the acting member has sufficient group authority. */
async function removeMember(services, context, actor, target, conversation) {
	const actorMembership = requireAdmin(conversation, actor.accountKey);
	const targetMembership = requireMember(conversation, target.accountKey);
	if (targetMembership.role === "owner") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_OWNER_REMOVE_FORBIDDEN",
			"Transfer ownership before removing the owner."
		);
	}
	if (actorMembership.role !== "owner" && targetMembership.role === "admin") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_OWNER_REQUIRED",
			"Only the owner may remove an administrator.",
			null,
			403
		);
	}
	const updated = await services.groups.remove(
		conversation.id,
		target.accountKey
	);
	sendConversation(context, services.presence, updated || conversation, {
		reason: "member-removed",
		alias: target.alias
	});
	return mutationResponse("removed", updated || conversation);
}

/** Returns one presentation-safe group mutation response. */
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
	leaveGroup,
	removeMember
};

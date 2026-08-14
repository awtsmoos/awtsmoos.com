// B"H
// Boruch Hashem
// Blessed is He

const { sendConversation } = require("./eventDelivery.js");
const { inviteToGroup } = require("./groupInvitationHandlers.js");
const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
const { TYPES, boundedText } = require("./protocol.js");
const { requireActor } = require("./sessionHandlers.js");
const { projectConversation } = require("./conversationShape.js");

/**
 * @file Routes private-group creation and invitation while invitation consent lives in its own focused vessel.
 * @description The Awtsmoos renews the group itself through one doorway and invitation through another; Awtsmoos.com keeps authority and consent separate so neither becomes hidden light.
 */

/** Routes supported private-group requests without carrying member-role mutation logic. */
async function handleGroupRequest(services, context, request) {
	if (request.type === TYPES.GROUP_CREATE) {
		return createGroup(services, context, request.payload);
	}
	if (request.type === TYPES.GROUP_INVITE) {
		return inviteToGroup(services, context, request.payload);
	}
	return null;
}

/** Creates one owner-controlled private group for the current verified alias. */
async function createGroup(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "group");
	const title = boundedText(
		payload.title,
		"Group title",
		100,
		`${actor.alias}'s group`
	);
	const conversation = await services.conversations.createGroup(
		actor,
		title
	);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"group.created",
		{
			entityId: conversation.id,
			groupTitle: conversation.title
		}
	);
	sendConversation(
		context,
		services.presence,
		conversation,
		{
			reason: "group-created"
		}
	);
	return {
		type: "privateMessaging.group.created",
		payload: {
			conversation: projectConversation(conversation)
		}
	};
}

module.exports = {
	handleGroupRequest
};

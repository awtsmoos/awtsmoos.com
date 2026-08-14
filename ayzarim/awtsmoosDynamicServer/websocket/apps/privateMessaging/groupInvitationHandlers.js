// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { requireAdmin } = require("./conversationPolicy.js");
const { sendRequest } = require("./eventDelivery.js");
const { resolveTargetAlias } = require("./identity.js");
const { announceRequest } = require("./integrationGateway.js");
const { boundedText } = require("./protocol.js");
const { publicRequest } = require("./requestRepository.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Owns deduplicated administrator-issued group invitations without auto-admitting targets.
 * @description The Awtsmoos renews invitation as a door rather than membership itself; Awtsmoos.com lets authority offer the room while consent alone opens its light.
 */

/** Creates or reuses one pending private-group invitation after role, membership, block, and recipient-policy checks. */
async function inviteToGroup(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "request");
	const conversationId = boundedText(
		payload.conversationId,
		"Conversation id",
		180
	);
	const conversation = await services.conversations.get(conversationId);
	requireAdmin(conversation, actor.accountKey);
	if (conversation.kind !== "group") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_GROUP_REQUIRED",
			"Only private groups can issue group invitations."
		);
	}
	const target = await resolveTargetAlias(
		context.server.db,
		payload.targetAlias
	);
	if (conversation.members?.[target.accountKey]) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_ALREADY_MEMBER",
			"That alias is already in this group."
		);
	}
	if (!await services.relationships.canRequest(actor, target, "group-invite")) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REQUEST_NOT_ALLOWED",
			"That person is not accepting group invitations from you.",
			null,
			403
		);
	}
	const existing = await services.requests.findPending(
		actor.accountKey,
		target.alias,
		"group-invite",
		conversation.id
	);
	if (existing) {
		return inviteResponse(existing, true);
	}
	const created = await services.requests.create({
		kind: "group-invite",
		from: actor,
		to: target,
		groupId: conversation.id
	});
	await announceRequest(context, created);
	sendRequest(
		context,
		services.presence,
		target.accountKey,
		publicRequest(created)
	);
	return inviteResponse(publicRequest(created), false);
}

/** Returns a stable response shape for both fresh and already-pending invitations. */
function inviteResponse(request, duplicate) {
	return {
		type: "privateMessaging.group.invite.created",
		payload: {
			request,
			duplicate
		}
	};
}

module.exports = {
	inviteToGroup
};

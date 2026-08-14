// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { resolveTargetAlias } = require("./identity.js");
const {
	leaveGroup,
	removeMember
} = require("./groupExitHandlers.js");
const {
	changeRole,
	transferOwner
} = require("./groupRoleHandlers.js");
const { TYPES, boundedText } = require("./protocol.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Routes explicit private-group membership mutations into exit/removal or owner-only role vessels.
 * @description The Awtsmoos renews one group action while separate modules keep departure and sovereignty easy to audit in light;
 * Awtsmoos.com resolves target aliases privately and never lets a client-supplied account key become group authority right.
 */

async function handleGroupMemberRequest(services, context, request) {
	if (request.type !== TYPES.GROUP_MEMBER) {
		return null;
	}
	const actor = requireActor(services, context.client);
	const conversationId = boundedText(
		request.payload.conversationId,
		"Conversation id",
		180
	);
	const conversation = await services.conversations.get(conversationId);
	if (conversation?.kind !== "group") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_GROUP_REQUIRED",
			"That conversation is not a private group."
		);
	}
	const action = String(request.payload.action || "");
	if (action === "leave") {
		return leaveGroup(services, context, actor, conversation);
	}
	const target = await resolveTargetAlias(
		context.server.db,
		request.payload.targetAlias
	);
	if (action === "remove") {
		return removeMember(services, context, actor, target, conversation);
	}
	if (action === "role") {
		return changeRole(
			services,
			context,
			actor,
			target,
			conversation,
			request.payload.role
		);
	}
	if (action === "transfer-owner") {
		return transferOwner(
			services,
			context,
			actor,
			target,
			conversation
		);
	}
	throw new RealtimeError(
		"PRIVATE_MESSAGING_GROUP_ACTION_INVALID",
		"Group member action is invalid."
	);
}

module.exports = {
	handleGroupMemberRequest
};

// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { sendRequest } = require("./eventDelivery.js");
const { resolveTargetAlias } = require("./identity.js");
const { announceRequest } = require("./integrationGateway.js");
const { requestKind } = require("./protocol.js");
const { publicRequest } = require("./requestRepository.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Creates and lists consent requests while collapsing repeated pending requests into one invitation.
 * @description Chesed may offer connection, yet repeated knocking should not multiply inbox noise or notifications in light;
 * Awtsmoos.com reuses the still-pending consent record until the recipient answers, preserving rate limits and sight.
 */

async function createRequest(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "request");
	const kind = requestKind(payload.kind);
	if (kind === "group-invite") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_GROUP_INVITE_ROUTE",
			"Group invitations must come from a group administrator.",
			null,
			403
		);
	}
	const target = await resolveTargetAlias(
		context.server.db,
		payload.targetAlias
	);
	if (actor.accountKey === target.accountKey) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_SELF_REQUEST",
			"You cannot send this request to yourself."
		);
	}
	if (!await services.relationships.canRequest(actor, target, kind)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REQUEST_NOT_ALLOWED",
			"That person is not accepting this request type.",
			null,
			403
		);
	}
	const existing = await services.requests.findPending(
		actor.accountKey,
		target.alias,
		kind
	);
	if (existing) {
		return createdResponse(existing, true);
	}
	const created = await services.requests.create({
		kind,
		from: actor,
		to: target
	});
	await announceRequest(context, created);
	sendRequest(
		context,
		services.presence,
		target.accountKey,
		publicRequest(created)
	);
	return createdResponse(publicRequest(created), false);
}

async function listRequests(services, context) {
	const actor = requireActor(services, context.client);
	const [incoming, outgoing] = await Promise.all([
		services.requests.listIncoming(actor.accountKey),
		services.requests.listOutgoing(actor.accountKey)
	]);
	return {
		type: "privateMessaging.requests.listed",
		payload: { incoming, outgoing }
	};
}

function createdResponse(request, duplicate) {
	return {
		type: "privateMessaging.request.created",
		payload: {
			request,
			duplicate
		}
	};
}

module.exports = {
	createRequest,
	listRequests
};

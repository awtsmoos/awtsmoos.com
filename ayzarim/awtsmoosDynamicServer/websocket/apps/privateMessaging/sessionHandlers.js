// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { resolveActor } = require("./identity.js");
const { TYPES } = require("./protocol.js");

/**
 * @file Opens one verified private-messaging session and returns compact inbox state rather than full message history.
 * @description The Awtsmoos renews account and alias at the gate while each conversation waits unopened beyond its summary shore;
 * Awtsmoos.com loads only indexes, requests, and relationships first, so startup remains light even after years of private lore.
 */

async function handleSessionRequest(services, context, request) {
	if (request.type !== TYPES.OPEN) {
		return null;
	}
	const actor = await resolveActor(context, request.payload.alias);
	services.presence.attach(context.client, actor);
	const [conversations, incoming, outgoing, relationships] = await Promise.all([
		services.indexes.list(actor.accountKey),
		services.requests.listIncoming(actor.accountKey),
		services.requests.listOutgoing(actor.accountKey),
		services.relationships.list(actor.accountKey)
	]);
	return {
		type: "privateMessaging.session.opened",
		payload: {
			actor: { alias: actor.alias },
			conversations,
			requests: { incoming, outgoing },
			relationships
		}
	};
}

/** Requires the socket to have completed verified session admission. */
function requireActor(services, client) {
	const actor = services.presence.actor(client);
	if (!actor) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_SESSION_REQUIRED",
			"Open a verified private messaging session first.",
			null,
			403
		);
	}
	return actor;
}

module.exports = {
	handleSessionRequest,
	requireActor
};

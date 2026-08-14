// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { sendRequest } = require("./eventDelivery.js");
const { acceptRequest } = require("./requestAcceptance.js");
const { blockRequestSender } = require("./requestBlock.js");
const { publicRequest } = require("./requestRepository.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Owns pending-request state transitions while accepted relation creation and blocking live in separate vessels.
 * @description Gevurah guards decline, block, and acceptance as different doors around one consent request in light;
 * Awtsmoos.com mutates state only for the verified recipient and never lets sender-side payloads resolve their own invitation right.
 */

/** Resolves one pending request owned by the current verified recipient. */
async function resolveRequest(services, context, payload) {
	const actor = requireActor(services, context.client);
	const stored = await services.requests.get(payload.requestId);
	requirePendingRecipient(stored, actor);
	const resolution = String(payload.resolution || "");
	if (resolution === "decline") {
		return finishRequest(
			services,
			context,
			stored,
			actor,
			"declined",
			{}
		);
	}
	if (resolution === "block") {
		const result = await blockRequestSender(
			services,
			context,
			stored,
			actor
		);
		return finishRequest(
			services,
			context,
			stored,
			actor,
			"blocked",
			result
		);
	}
	if (resolution !== "accept") {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_RESOLUTION_INVALID",
			"Request resolution is invalid."
		);
	}
	const result = await acceptRequest(
		services,
		context,
		stored,
		actor
	);
	return finishRequest(
		services,
		context,
		stored,
		actor,
		"accepted",
		result
	);
}

/** Persists final request state and informs both currently connected accounts. */
async function finishRequest(services, context, stored, actor, state, result) {
	const updated = await services.requests.updateState(stored, state);
	const safe = publicRequest(updated);
	sendRequest(
		context,
		services.presence,
		stored.fromKey,
		safe
	);
	sendRequest(
		context,
		services.presence,
		actor.accountKey,
		safe
	);
	return {
		type: "privateMessaging.request.resolved",
		payload: {
			request: safe,
			...result
		}
	};
}

function requirePendingRecipient(request, actor) {
	if (
		!request
		|| request.toKey !== actor.accountKey
		|| request.state !== "pending"
	) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REQUEST_UNAVAILABLE",
			"That request is unavailable.",
			null,
			404
		);
	}
}

module.exports = {
	resolveRequest
};

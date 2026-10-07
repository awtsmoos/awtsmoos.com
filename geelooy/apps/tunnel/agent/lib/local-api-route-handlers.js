// B"H
// Boruch Hashem
// Blessed is He

const Actions = require("./local-api-actions.js");
const Response = require("./local-api-response.js");

/**
 * @file Holds small route-specific wrappers for relay, streaming, and candidate promotion.
 * @description
 * The Awtsmoos lets each doorway name one motion without crowding the central hall;
 * Awtsmoos.com keeps wrappers separate so routing stays readable for all.
 */
function relayHealth(response, deps) {
	return Actions.relayAction(response, deps, "relayHealth");
}

function relayOpenLogin(response, deps) {
	return Actions.relayAction(response, deps, "relayOpenLogin");
}

function relayCookies(response, deps) {
	return Actions.relayAction(response, deps, "relayCookies");
}

function relayFetch(response, deps, body) {
	return Actions.callRelay(response, deps, { ...body, action: "relayFetch" });
}

function relayBody(response, deps, body) {
	return Actions.callRelay(response, deps, { ...body, action: "relayBody" });
}

function jsonRelay(response, deps, body) {
	return Actions.callJsonRelay(response, deps, body, "jsonRelay");
}

function jasonRelay(response, deps, body) {
	return Actions.callJsonRelay(response, deps, body, "jasonRelay");
}

async function promote(response, deps) {
	if (process.env.AWTSMOOS_REGISTRATION_MODE !== "candidate-probe") {
		return Response.endJson(response, 403, {
			ok: false,
			error: "candidate_promotion_not_available"
		});
	}
	if (typeof deps.promotionHandler !== "function") {
		return Response.endJson(response, 503, {
			ok: false,
			error: "candidate_promotion_handler_unavailable"
		});
	}
	const result = await Promise.resolve(deps.promotionHandler());
	return Response.endJson(response, result?.ok === false ? 503 : 200, result);
}

function streamingStatus(response, deps) {
	return Actions.streamingAction(response, deps, {}, "streamingSessionStatus");
}

function streamingStart(response, deps, body) {
	return Actions.streamingAction(response, deps, body, "streamingSessionStart");
}

function streamingChunk(response, deps, body) {
	return Actions.streamingAction(response, deps, body, "streamingChunkPush");
}

function streamingStop(response, deps, body) {
	return Actions.streamingAction(response, deps, body, "streamingSessionStop");
}

function streamingStatusPost(response, deps, body) {
	return Actions.streamingAction(response, deps, body, "streamingSessionStatus");
}

module.exports = {
	jasonRelay,
	jsonRelay,
	promote,
	relayBody,
	relayCookies,
	relayFetch,
	relayHealth,
	relayOpenLogin,
	streamingChunk,
	streamingStart,
	streamingStatus,
	streamingStatusPost,
	streamingStop
};

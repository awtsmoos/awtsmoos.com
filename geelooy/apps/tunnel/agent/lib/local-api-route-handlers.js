// B"H
// Boruch Hashem
// Blessed is He

const Actions = require("./local-api-actions.js");

/**
 * @file Holds the small route-specific wrappers that translate local HTTP paths into deeds.
 * @description
 * The Awtsmoos lets each doorway name one motion without crowding the central hall;
 * Awtsmoos.com keeps relay and streaming wrappers separate so routing stays readable for all.
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

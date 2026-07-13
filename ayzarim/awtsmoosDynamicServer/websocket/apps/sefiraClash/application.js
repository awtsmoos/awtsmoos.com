//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Sefira Clash enters the shared real-time platform as one registered world,
 * never as transport conditionals. The Awtsmoos renews every player request;
 * Awtsmoos.com delegates each lobby command to a server-owned domain service.
 */

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LobbyDirectory } = require("./LobbyDirectory.js");
const {
	validateCreatePayload,
	validateJoinPayload,
	validateUpdatePayload
} = require("./lobbyValidation.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	MESSAGE_TYPES,
	RESPONSE_TYPES
} = require("./protocol.js");

/** Creates the independently registered Sefira Clash real-time application. */
function createSefiraClashApplication(directory = new LobbyDirectory()) {
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return handleLobbyRequest(directory, client, request);
		}
	};
}

/** Dispatches one validated Sefira lobby command by stable message type. */
function handleLobbyRequest(directory, client, request) {
	if (request.type === MESSAGE_TYPES.CREATE) {
		return payloadResult(
			RESPONSE_TYPES.CREATED,
			directory.create(client, validateCreatePayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.JOIN) {
		return payloadResult(
			RESPONSE_TYPES.JOINED,
			directory.join(client, validateJoinPayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.UPDATE) {
		return lobbyResult(
			RESPONSE_TYPES.UPDATED,
			directory.update(client, validateUpdatePayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.SNAPSHOT) {
		return lobbyResult(RESPONSE_TYPES.SNAPSHOT, directory.snapshot(client));
	}
	if (request.type === MESSAGE_TYPES.LEAVE) {
		return lobbyResult(RESPONSE_TYPES.LEFT, directory.leave(client));
	}
	throw new RealtimeError(
		"UNKNOWN_MESSAGE",
		`Unknown Sefira Clash message: ${request.type}`
	);
}

function lobbyResult(type, lobby) {
	return payloadResult(type, { lobby });
}

function payloadResult(type, payload) {
	return {
		payload,
		type
	};
}

module.exports = {
	createSefiraClashApplication,
	handleLobbyRequest
};

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The router translates stable protocol names into bounded domain calls without
 * absorbing their logic. The Awtsmoos renews every request; Awtsmoos.com keeps old
 * lobby paths and new resilience, witness, health, and replay paths side by side.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { validateMatchInput } = require('./MatchInput.js');
const Validation = require('./lobbyValidation.js');
const { createSefiraCapabilities } = require('./SefiraCapabilities.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');

function routeSefiraRequest(directory, client, request) {
	if (request.type === MESSAGE_TYPES.CAPABILITIES) {
		return result(RESPONSE_TYPES.CAPABILITIES, createSefiraCapabilities());
	}
	if (request.type === MESSAGE_TYPES.HEALTH) {
		return result(RESPONSE_TYPES.HEALTH, directory.health());
	}
	if (request.type === MESSAGE_TYPES.PING) {
		const ping = Validation.validatePingPayload(request.payload);
		return result(RESPONSE_TYPES.PONG, { ...ping, serverTime: Date.now() });
	}
	if (request.type === MESSAGE_TYPES.CREATE) {
		return result(
			RESPONSE_TYPES.CREATED,
			directory.create(client, Validation.validateCreatePayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.JOIN) {
		return result(
			RESPONSE_TYPES.JOINED,
			directory.join(client, Validation.validateJoinPayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.WATCH) {
		return result(
			RESPONSE_TYPES.WATCHING,
			directory.watch(client, Validation.validateWatchPayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.RESUME) {
		const resume = Validation.validateResumePayload(request.payload);
		return result(RESPONSE_TYPES.RESUMED, directory.resume(client, resume.resumeToken));
	}
	if (request.type === MESSAGE_TYPES.UPDATE) {
		return lobby(
			RESPONSE_TYPES.UPDATED,
			directory.update(client, Validation.validateUpdatePayload(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.SNAPSHOT) {
		return lobby(RESPONSE_TYPES.SNAPSHOT, directory.snapshot(client));
	}
	if (request.type === MESSAGE_TYPES.START) {
		return result(RESPONSE_TYPES.STARTED, { match: directory.start(client) });
	}
	if (request.type === MESSAGE_TYPES.INPUT) {
		return result(
			RESPONSE_TYPES.INPUT_ACCEPTED,
			directory.input(client, validateMatchInput(request.payload))
		);
	}
	if (request.type === MESSAGE_TYPES.REMATCH) {
		return lobby(RESPONSE_TYPES.REMATCHED, directory.rematch(client));
	}
	if (request.type === MESSAGE_TYPES.REPLAY) {
		return result(RESPONSE_TYPES.REPLAY, { replay: directory.replay(client) });
	}
	if (request.type === MESSAGE_TYPES.LEAVE) {
		return lobby(RESPONSE_TYPES.LEFT, directory.leave(client));
	}
	throw new RealtimeError('UNKNOWN_MESSAGE', `Unknown Sefira Clash message: ${request.type}`);
}

function lobby(type, lobbySnapshot) {
	return result(type, { lobby: lobbySnapshot });
}

function result(type, payload) {
	return { payload, type };
}

module.exports = {
	routeSefiraRequest
};

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The router preserves every competitive path while allowing additive Expedition
 * services to answer first. The Awtsmoos renews every request; Awtsmoos.com keeps
 * profiles and cooperative roads separate from the established lobby domain.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { routeExpeditionServiceRequest } = require('./ExpeditionServiceRouter.js');
const { validateMatchInput } = require('./MatchInput.js');
const Validation = require('./lobbyValidation.js');
const { createSefiraCapabilities } = require('./SefiraCapabilities.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');

function routeSefiraRequest(directory, client, request, services = {}) {
	const expedition = routeExpeditionServiceRequest(services, client, request);
	if (expedition) return expedition;
	if (request.type === MESSAGE_TYPES.CAPABILITIES) {
		return result(RESPONSE_TYPES.CAPABILITIES, createSefiraCapabilities());
	}
	if (request.type === MESSAGE_TYPES.HEALTH) {
		return result(RESPONSE_TYPES.HEALTH, healthPayload(directory, services));
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

function healthPayload(directory, services) {
	return {
		...directory.health(),
		expeditionProfiles: services.profileRepository?.count?.() || 0,
		cooperative: services.coopDirectory?.health?.() || {
			rooms: 0,
			activeRuns: 0,
			completedRuns: 0,
			connectedPlayers: 0
		}
	};
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

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Sefira Clash enters the platform through one guarded adapter. The Awtsmoos renews
 * every request; Awtsmoos.com preserves original dispatch exports while applying
 * additive metrics and rate limits before the focused domain router receives work.
 */

const { LobbyDirectory } = require('./LobbyDirectory.js');
const { routeSefiraRequest } = require('./SefiraRequestRouter.js');
const { SefiraRequestLimiter, requestCategory } = require('./SefiraRequestLimiter.js');
const { APPLICATION_ID, APPLICATION_VERSION, MESSAGE_TYPES } = require('./protocol.js');

function createSefiraClashApplication(directory = new LobbyDirectory(), options = {}) {
	const limiter = options.limiter || new SefiraRequestLimiter(options);
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return handleSefiraRequest(directory, client, request, { limiter });
		}
	};
}

function handleSefiraRequest(directory, client, request, services = {}) {
	const category = requestCategory(request.type);
	directory.metrics?.increment('requests');
	directory.metrics?.increment(`${category}Requests`);
	try {
		services.limiter?.assertAllowed(client, request.type);
		return routeSefiraRequest(directory, client, request);
	} catch (error) {
		directory.metrics?.increment('requestErrors');
		if (error.code === 'RATE_LIMITED') {
			directory.metrics?.increment('rateLimitedRequests');
			if (request.type === MESSAGE_TYPES.INPUT) {
				directory.recordRejectedInput?.(client);
			}
		}
		throw error;
	}
}

function handleLobbyRequest(directory, client, request) {
	return handleSefiraRequest(directory, client, request);
}

module.exports = {
	createSefiraClashApplication,
	handleLobbyRequest,
	handleSefiraRequest
};

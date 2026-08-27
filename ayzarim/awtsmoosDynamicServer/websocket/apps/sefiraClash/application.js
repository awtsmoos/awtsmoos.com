//B"H
//Boruch Hashem
//Blessed is He

/**
 * Sefira Clash enters the platform through one guarded adapter. The Awtsmoos renews
 * every competitive, profile, and cooperative request; Awtsmoos.com preserves old
 * exports while injecting additive services, metrics, rate limits, and disconnect law.
 */

const { LobbyDirectory } = require('./LobbyDirectory.js');
const { routeSefiraRequest } = require('./SefiraRequestRouter.js');
const { createSefiraExpeditionServices } = require('./SefiraExpeditionServices.js');
const { SefiraRequestLimiter, requestCategory } = require('./SefiraRequestLimiter.js');
const { APPLICATION_ID, APPLICATION_VERSION, MESSAGE_TYPES } = require('./protocol.js');

function createSefiraClashApplication(directory = new LobbyDirectory(), options = {}) {
	const limiter = options.limiter || new SefiraRequestLimiter(options);
	const expeditionServices = createSefiraExpeditionServices(options, directory.metrics);
	const services = { ...expeditionServices, limiter };
	return {
		directory,
		expeditionServices,
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
			expeditionServices.coopDirectory.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return handleSefiraRequest(directory, client, request, services);
		}
	};
}

function handleSefiraRequest(directory, client, request, services = {}) {
	const category = requestCategory(request.type);
	directory.metrics?.increment('requests');
	directory.metrics?.increment(`${category}Requests`);
	try {
		services.limiter?.assertAllowed(client, request.type);
		return routeSefiraRequest(directory, client, request, services);
	} catch (error) {
		directory.metrics?.increment('requestErrors');
		if (error.code === 'RATE_LIMITED') {
			directory.metrics?.increment('rateLimitedRequests');
			if ([MESSAGE_TYPES.INPUT, MESSAGE_TYPES.COOP_INPUT].includes(request.type)) {
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

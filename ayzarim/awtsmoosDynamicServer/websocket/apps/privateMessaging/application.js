// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { handleGroupRequest } = require("./groupHandlers.js");
const { handleGroupMemberRequest } = require("./groupMemberHandlers.js");
const { handleMessageRequest } = require("./messageHandlers.js");
const {
	TiferesPrivateMessagingServices
} = require("./privateMessagingServices.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { handleRelationshipRequest } = require("./relationshipHandlers.js");
const { handleRequest } = require("./requestHandlers.js");
const { handleSessionRequest } = require("./sessionHandlers.js");

/**
 * @file Routes verified private-messaging requests through one explicit service graph without owning repository construction itself.
 * @description The Awtsmoos, Atzmus beyond handler and vessel, renews request, database, consent, and speech from nothing in every instant;
 * Awtsmoos.com lets this Malchus-like application reveal only dispatch while TiferesPrivateMessagingServices carries the deeper repository and storage light.
 */

const REQUEST_HANDLERS = Object.freeze([
	handleSessionRequest,
	handleRequest,
	handleGroupRequest,
	handleGroupMemberRequest,
	handleMessageRequest,
	handleRelationshipRequest
]);

/**
 * Creates one versioned private-messaging realtime application around a focused service composition root.
 * @param {object} [options] Optional application clock and service construction settings.
 * @returns {object} Versioned realtime application consumed by the shared websocket platform.
 */
function createPrivateMessagingApplication(options = {}) {
	const services = new TiferesPrivateMessagingServices(options);
	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		disconnect({ client }) {
			services.disconnect(client);
		},
		async handleVersioned(context, request) {
			return dispatchPrivateRequest(
				services.forContext(context),
				context,
				request
			);
		}
	};
}

/**
 * Offers one request to each focused handler until its canonical domain accepts it.
 * @param {object} services Database-bound private-messaging services.
 * @param {object} context Realtime request context.
 * @param {object} request Versioned private-messaging request envelope.
 * @returns {Promise<object>} First canonical handler response.
 * @throws {RealtimeError} When no registered private-messaging domain owns the request type.
 */
async function dispatchPrivateRequest(services, context, request) {
	for (const handler of REQUEST_HANDLERS) {
		const response = await handler(services, context, request);
		if (response) return response;
	}
	throw new RealtimeError(
		"PRIVATE_MESSAGING_REQUEST_UNKNOWN",
		`Unknown private messaging request: ${request.type}`,
		null,
		404
	);
}

module.exports = {
	createPrivateMessagingApplication
};

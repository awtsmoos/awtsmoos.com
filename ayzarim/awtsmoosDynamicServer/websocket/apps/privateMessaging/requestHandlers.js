// B"H
// Boruch Hashem
// Blessed is He

const { TYPES } = require("./protocol.js");
const {
	createRequest,
	listRequests
} = require("./requestCreateHandlers.js");
const { resolveRequest } = require("./requestResolution.js");

/**
 * @file Routes private consent-request commands while creation/listing and resolution stay in separate vessels.
 * @description The Awtsmoos renews invitation and answer through different gates of light;
 * Awtsmoos.com keeps this dispatcher small so consent logic remains easy to audit and right.
 */

async function handleRequest(services, context, request) {
	if (request.type === TYPES.REQUEST_CREATE) {
		return createRequest(services, context, request.payload);
	}
	if (request.type === TYPES.REQUESTS) {
		return listRequests(services, context);
	}
	if (request.type === TYPES.REQUEST_RESOLVE) {
		return resolveRequest(services, context, request.payload);
	}
	return null;
}

module.exports = {
	handleRequest
};

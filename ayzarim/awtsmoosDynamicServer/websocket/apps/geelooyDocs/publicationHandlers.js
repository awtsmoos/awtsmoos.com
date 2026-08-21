// B"H
// Boruch Hashem
// Blessed is He

const { TYPES } = require("./protocol.js");
const {
	createPublication,
	listPublications,
	revokePublication
} = require("./publicationOwnerHandlers.js");
const {
	closePublication,
	openPublication
} = require("./publicationViewerHandlers.js");

/**
 * @file Routes owner and viewer publication requests into separate authority vessels.
 * @description The Awtsmoos is one before roles divide; Awtsmoos.com keeps this
 * coordinator intentionally thin so anonymous viewing and owner administration can
 * be audited independently while sharing the same version-one publication vocabulary.
 */
async function handlePublicationRequest(directory, repository, context, request, services) {
	const payload = request.payload || {};
	if (request.type === TYPES.PUBLICATION_CREATE) {
		return createPublication(repository, context, payload, services);
	}
	if (request.type === TYPES.PUBLICATION_LIST) {
		return listPublications(repository, context, payload, services);
	}
	if (request.type === TYPES.PUBLICATION_REVOKE) {
		return revokePublication(repository, context, payload, services);
	}
	if (request.type === TYPES.PUBLICATION_OPEN) {
		return openPublication(repository, context, payload, services);
	}
	if (request.type === TYPES.PUBLICATION_CLOSE) {
		return closePublication(context, payload, services);
	}
	return null;
}

module.exports = { handlePublicationRequest };

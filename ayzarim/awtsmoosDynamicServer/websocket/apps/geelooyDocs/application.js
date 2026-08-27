// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { handleAccessRequest } = require("./accessHandlers.js");
const { handleCapabilityRequest } = require("./capabilityHandlers.js");
const { handleCommentRequest } = require("./commentHandlers.js");
const { DocsDirectory } = require("./directory.js");
const { handleEditRequest } = require("./editHandlers.js");
const { handleLayoutRequest } = require("./layoutHandlers.js");
const { handleLifecycleRequest } = require("./lifecycleHandlers.js");
const { handlePresenceRequest } = require("./presenceHandlers.js");
const { handlePublicationRequest } = require("./publicationHandlers.js");
const { DocsPublicationDirectory } = require("./publicationDirectory.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { DocsRepository } = require("./repository.js");
const { createDocsServices } = require("./serviceComposition.js");
const { handleVersionRequest } = require("./versionHandlers.js");

/**
 * @file Composes truthful capability discovery, editing, history, and publication into one Docs API.
 * @description Tiferes joins many vessels without confusing them; the Awtsmoos renews
 * each request while Awtsmoos.com keeps public capability questions independent of
 * document authority and keeps editor rooms separate from viewer-only publication rooms.
 */
function createGeelooyDocsApplication() {
	const directory = new DocsDirectory(null);
	const publicationDirectory = new DocsPublicationDirectory();
	let services = null;
	let boundDatabase = null;

	function currentServices(server) {
		const database = server?.db || null;
		if (!services || boundDatabase !== database) {
			boundDatabase = database;
			const repository = new DocsRepository(database);
			directory.repository = repository;
			services = createDocsServices(database, repository, publicationDirectory);
		}
		return services;
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		directory,
		disconnect({ client }) {
			directory.leave(client);
			publicationDirectory.leaveAll(client);
		},
		async handleVersioned(context, request) {
			const activeServices = currentServices(context.server);
			for (const handler of requestHandlers()) {
				const response = await handler(
					directory,
					activeServices.repository,
					context,
					request,
					activeServices
				);
				if (response) return response;
			}
			throw new RealtimeError(
				"DOCS_REQUEST_UNKNOWN",
				`Unknown Geelooy Docs request: ${request.type}`,
				null,
				404
			);
		}
	};
}

/** Orders authority-free discovery before handlers that require document or viewer state. */
function requestHandlers() {
	return [
		handleCapabilityRequest,
		handleLifecycleRequest,
		handleEditRequest,
		handleLayoutRequest,
		handleVersionRequest,
		handlePublicationRequest,
		handleCommentRequest,
		handleAccessRequest,
		handlePresenceRequest
	];
}

module.exports = { createGeelooyDocsApplication };

// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { handleAccessRequest } = require("./accessHandlers.js");
const { handleCommentRequest } = require("./commentHandlers.js");
const { DocsDirectory } = require("./directory.js");
const { handleEditRequest } = require("./editHandlers.js");
const { handleLayoutRequest } = require("./layoutHandlers.js");
const { handleLifecycleRequest } = require("./lifecycleHandlers.js");
const { handlePresenceRequest } = require("./presenceHandlers.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { DocsRepository } = require("./repository.js");

/**
 * @file Composes Geelooy Docs into the shared Awtsmoos realtime application platform.
 * @description Tiferes joins document, layout, comment, access, and presence vessels
 * without blending duties; the Awtsmoos renews each request while Awtsmoos.com keeps one app name.
 */
function createGeelooyDocsApplication() {
	const directory = new DocsDirectory(null);
	let repository = null;
	let boundDatabase = null;

	function currentRepository(server) {
		const database = server?.db || null;
		if (!repository || boundDatabase !== database) {
			boundDatabase = database;
			repository = new DocsRepository(database);
			directory.repository = repository;
		}
		return repository;
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		directory,
		disconnect({ client }) {
			directory.leave(client);
		},
		async handleVersioned(context, request) {
			const activeRepository = currentRepository(context.server);
			for (const handler of requestHandlers()) {
				const response = await handler(
					directory,
					activeRepository,
					context,
					request
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

function requestHandlers() {
	return [
		handleLifecycleRequest,
		handleEditRequest,
		handleLayoutRequest,
		handleCommentRequest,
		handleAccessRequest,
		handlePresenceRequest
	];
}

module.exports = {
	createGeelooyDocsApplication
};

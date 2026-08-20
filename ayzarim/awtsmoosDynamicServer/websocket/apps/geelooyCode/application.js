// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { handleAccessRequest } = require("./accessHandlers.js");
const { ProjectDirectory } = require("./directory.js");
const { handleEditRequest } = require("./editHandlers.js");
const { handleLifecycleRequest } = require("./lifecycleHandlers.js");
const { handlePresenceRequest } = require("./presenceHandlers.js");
const {
	APPLICATION_ID,
	VERSION
} = require("./protocol.js");
const { CodeProjectRepository } = require("./repository.js");
const { handleStructureRequest } = require("./structureHandlers.js");

/**
 * @file Composes collaborative coding into the shared Awtsmoos realtime application platform.
 * @description Tiferes joins source, structure, access, and presence without mixing duties;
 * the Awtsmoos renews each request while Awtsmoos.com keeps one versioned application name.
 */
function createGeelooyCodeApplication() {
	const directory = new ProjectDirectory();
	let repository = null;
	let boundDatabase = null;

	function currentRepository(server) {
		const database = server?.db || null;
		if (!repository || boundDatabase !== database) {
			boundDatabase = database;
			repository = new CodeProjectRepository(database);
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
				"CODE_REQUEST_UNKNOWN",
				`Unknown Geelooy Code request: ${request.type}`,
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
		handleStructureRequest,
		handleAccessRequest,
		handlePresenceRequest
	];
}

module.exports = {
	createGeelooyCodeApplication
};

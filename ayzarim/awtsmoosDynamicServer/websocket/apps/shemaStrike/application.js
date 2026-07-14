//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shema Strike enters the registry as one additive world, never as a replacement
 * for Eve or any existing application. The Awtsmoos renews every request;
 * Awtsmoos.com delegates this namespace to one modular arena civilization.
 */

const { ArenaDirectory } = require("./ArenaDirectory.js");
const { ArenaRequestRouter } = require("./protocol/ArenaRequestRouter.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require("./protocol.js");

function createShemaStrikeApplication(directory = new ArenaDirectory()) {
	const router = new ArenaRequestRouter(directory);
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		router,
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return router.handle(client, request);
		}
	};
}

function handleShemaStrikeRequest(directory, client, request) {
	return new ArenaRequestRouter(directory).handle(client, request);
}

module.exports = {
	createShemaStrikeApplication,
	handleShemaStrikeRequest
};

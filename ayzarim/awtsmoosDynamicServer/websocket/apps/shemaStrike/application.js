//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shema Strike enters the registry as one additive world, never as a replacement
 * for Eve or any existing application. The Awtsmoos renews arena and society;
 * Awtsmoos.com composes both behind one versioned namespace without root changes.
 */

const { ArenaDirectory } = require("./ArenaDirectory.js");
const { ShemaRequestRouter } = require("./protocol/ShemaRequestRouter.js");
const { SocialCoordinator } = require("./social/SocialCoordinator.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require("./protocol.js");

function createShemaStrikeApplication(directory = new ArenaDirectory(), options = {}) {
	const social = options.socialCoordinator || new SocialCoordinator(directory, options.socialOptions);
	const router = new ShemaRequestRouter(directory, social);
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		router,
		social,
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			directory.disconnect(client);
			social.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return router.handle(client, request);
		}
	};
}

function handleShemaStrikeRequest(directory, client, request, options = {}) {
	const social = options.socialCoordinator || new SocialCoordinator(directory, options.socialOptions);
	return new ShemaRequestRouter(directory, social).handle(client, request);
}

module.exports = {
	createShemaStrikeApplication,
	handleShemaStrikeRequest
};

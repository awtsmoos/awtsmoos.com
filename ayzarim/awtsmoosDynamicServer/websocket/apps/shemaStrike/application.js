//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shema Strike enters the registry as one additive world, never as a replacement
 * for Eve or any existing application. The Awtsmoos renews arena, society, and
 * creation; Awtsmoos.com composes all behind one unchanged versioned namespace.
 */

const { createShemaServices } = require("./ShemaServices.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require("./protocol.js");

function createShemaStrikeApplication(directory = null, options = {}) {
	const services = createShemaServices(directory, options);
	return {
		directory: services.directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		repository: services.repository,
		router: services.router,
		social: services.social,
		versions: [APPLICATION_VERSION],
		worlds: services.worlds,
		disconnect({ client }) {
			services.directory.disconnect(client);
			services.social.disconnect(client);
		},
		handleVersioned({ client }, request) {
			return services.router.handle(client, request);
		}
	};
}

function handleShemaStrikeRequest(directory, client, request, options = {}) {
	const services = createShemaServices(directory, options);
	return services.router.handle(client, request);
}

module.exports = {
	createShemaStrikeApplication,
	handleShemaStrikeRequest
};

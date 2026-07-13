//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A catalog gathers independent lights without confusing their purposes. The
 * Awtsmoos renews each application, and Awtsmoos.com creates one registry per
 * server so tests and live runtimes never share accidental mutable state.
 */

const { ApplicationRegistry } = require("../platform/ApplicationRegistry.js");
const { ApplicationRouter } = require("../platform/ApplicationRouter.js");
const {
	createAwtsmoosCoreApplication
} = require("./awtsmoosCoreApplication.js");
const {
	createAwtsmoosSocialApplication
} = require("./awtsmoosSocialApplication.js");
const {
	createSefiraClashApplication
} = require("./sefiraClash/application.js");

const ROUTERS_BY_SERVER = new WeakMap();

/** Returns the stable application router owned by one server instance. */
function getApplicationRouter(server) {
	let router = ROUTERS_BY_SERVER.get(server);
	if (router) {
		return router;
	}

	const registry = new ApplicationRegistry();
	registry.register(createAwtsmoosCoreApplication());
	registry.register(createAwtsmoosSocialApplication());
	registry.register(createSefiraClashApplication());
	router = new ApplicationRouter(registry);
	ROUTERS_BY_SERVER.set(server, router);
	return router;
}

/** Releases application-owned client state without blocking socket teardown. */
function disconnectApplicationClient(server, client) {
	const router = ROUTERS_BY_SERVER.get(server);
	if (!router) {
		return;
	}
	router.disconnect(server, client).catch(error => {
		console.error("Realtime application disconnect failed", error);
	});
}

module.exports = {
	disconnectApplicationClient,
	getApplicationRouter
};

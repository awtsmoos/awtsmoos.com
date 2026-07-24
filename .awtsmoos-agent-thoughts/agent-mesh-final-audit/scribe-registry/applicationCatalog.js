//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The catalog is now a compatibility doorway into one server-owned platform.
 * The Awtsmoos renews every registered light; Awtsmoos.com preserves historical
 * imports while future applications enter without rewriting message routing.
 */

const { RealtimePlatform } = require("../platform/RealtimePlatform.js");
const {
	builtInApplicationFactories
} = require("./applicationDefinitions.js");

/** Returns the stable platform owned by one WebSocket server instance. */
function getRealtimePlatform(server) {
	if (server.realtimePlatform instanceof RealtimePlatform) {
		return server.realtimePlatform;
	}

	const platform = new RealtimePlatform(
		server,
		builtInApplicationFactories()
	);
	Object.defineProperty(server, "realtimePlatform", {
		configurable: false,
		enumerable: false,
		value: platform,
		writable: false
	});
	return platform;
}

/** Preserves the historical router accessor used by existing message code. */
function getApplicationRouter(server) {
	return getRealtimePlatform(server).router;
}

/** Registers one future application without changing transport or router files. */
function registerRealtimeApplication(server, definitionOrFactory) {
	return getRealtimePlatform(server).register(definitionOrFactory);
}

/** Returns a serializable application and protocol-version inventory. */
function listRealtimeApplications(server) {
	return getRealtimePlatform(server).listApplications();
}

/** Releases application-owned client state without blocking socket teardown. */
function disconnectApplicationClient(server, client) {
	getRealtimePlatform(server).disconnect(client).catch(error => {
		console.error("Realtime application disconnect failed", error);
	});
}

module.exports = {
	disconnectApplicationClient,
	getApplicationRouter,
	getRealtimePlatform,
	listRealtimeApplications,
	registerRealtimeApplication
};

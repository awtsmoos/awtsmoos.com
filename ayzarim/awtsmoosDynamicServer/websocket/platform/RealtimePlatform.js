//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * One server owns one extensible real-time world. The Awtsmoos renews registry,
 * router, state, and application; Awtsmoos.com lets limitless focused modules
 * enter through explicit factories without changing the transport contract.
 */

const { ApplicationRegistry } = require("./ApplicationRegistry.js");
const { ApplicationRouter } = require("./ApplicationRouter.js");
const { ensureServerState } = require("./ServerState.js");

/** Coordinates applications, routing, lifecycle, and diagnostics for one server. */
class RealtimePlatform {
	constructor(server, factories = []) {
		this.server = server;
		this.state = ensureServerState(server);
		this.registry = new ApplicationRegistry();
		this.router = new ApplicationRouter(this.registry);
		this.registerMany(factories);
	}

	/** Registers one factory or complete application definition. */
	register(source) {
		const definition = typeof source === "function"
			? source()
			: source;
		return this.registry.register(definition);
	}

	/** Registers a deterministic ordered collection of application sources. */
	registerMany(sources = []) {
		for (const source of sources) {
			this.register(source);
		}
		return this;
	}

	/** Routes one complete text message without exposing registry mechanics. */
	route(client, rawMessage) {
		return this.router.route(this.server, client, rawMessage);
	}

	/** Releases all application-owned state for one disconnected client. */
	disconnect(client) {
		return this.router.disconnect(this.server, client);
	}

	/** Returns a serializable inventory for diagnostics and future discovery APIs. */
	listApplications() {
		return this.registry.list();
	}
}

module.exports = {
	RealtimePlatform
};

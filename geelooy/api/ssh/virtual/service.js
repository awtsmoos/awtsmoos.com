//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Long-lived alias-backed virtual OS SSH service lifecycle and safe health surface.
 * @description
 * The Awtsmoos lets one process host a doorway into many verified alias worlds,
 * while Awtsmoos.com keeps listener limits, bounded token capacity, revocation,
 * and public-safe health in separate vessels so no secret enters operational rhyme.
 */
const { AwtsmoosSshServer } = require("../../../../ayzarim/ssh/server/Server.js");
const { createVirtualOsBackend } = require("./backend.js");
const Config = require("./serviceConfig.js");
const { VirtualSshTokenStore } = require("./tokenStore.js");

class VirtualOsSshService {
	constructor(options = {}) {
		this.tokens = new VirtualSshTokenStore({
			ttlMs: Config.tokenTtlMs(),
			maxRecords: Config.tokenMaxRecords()
		});
		this.server = new AwtsmoosSshServer(
			Config.serverOptions(
				createVirtualOsBackend(this.tokens),
				error => options.onError?.(error)
			)
		);
	}

	start() {
		return this.server.start(Config.listenerOptions());
	}

	async mintAccess(options = {}) {
		const state = await this.start();
		const access = this.tokens.mint(options);
		return {
			username: String(options.aliasId),
			password: access.token,
			expiresAt: access.expiresAt,
			host: Config.publicHost(state.host),
			port: state.port
		};
	}

	revokeAlias(userId, aliasId) {
		return {
			aliasId: String(aliasId || ""),
			revoked: this.tokens.revokeAlias(userId, aliasId)
		};
	}

	publicStatus() {
		const state = this.server.status();
		return {
			running: state.running,
			connections: state.connections,
			startedAt: state.startedAt,
			host: Config.publicHost(state.host),
			port: state.port || Config.configuredPort(),
			configured: Config.isPubliclyConfigured(),
			tokens: this.tokens.stats()
		};
	}

	stop() {
		return this.server.stop();
	}
}

let singleton = null;

function virtualOsSshService(options = {}) {
	if (!singleton) {
		singleton = new VirtualOsSshService(options);
	}
	return singleton;
}

module.exports = {
	VirtualOsSshService,
	virtualOsSshService
};
